import Minio from 'minio'

// import mime from 'mime-types'
import mime from 'mime'
// move to global script to use minio sdk in vite
// TODO: make it lazy load
declare const minio: typeof Minio

const minioClient1 = new minio.Client({
  endPoint: '192.168.199.252',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
})

type ResolvedPath = {
  bucket:string,
  path:string,
  fsPath:string,
  minioClient :Minio.Client
}

export async function resolvePath(path: string, fsPath = '/', bucket = 'private', minioClient = minioClient1): Promise<ResolvedPath> {
  const paths = path.split('/')
  let linkFileIndex = -1

  paths.some((p, index) => {
    if (p.match(/!\[[^]+]\.s3/)) {
      linkFileIndex = index

      return true
    }
    return false
  })
  // TODO: recursive link file find
  if (linkFileIndex !== -1 && linkFileIndex !== paths.length - 1) {
    const linkFilePath = paths.slice(0, linkFileIndex + 1).join('/')
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const linkFileText = await getFileAsText(linkFilePath)
    const linkObject = JSON.parse(linkFileText)
    const restPath = paths.slice(linkFileIndex + 1).join('/')

    return resolvePath(restPath, `${fsPath + linkFilePath}/`, linkObject.bucket, minioClient)

    // return {
    //   bucket: linkObject.bucket,
    //   path: restPath,
    //   fsPath: `${linkFilePath}/`,
    //   minioClient: new minio.Client({
    //     endPoint: linkObject.endPoint,
    //     port: linkObject.port,
    //     useSSL: linkObject.useSSL,
    //     accessKey: linkObject.accessKey,
    //     secretKey: linkObject.secretKey,
    //   }),
    // }
  }
  return {
    bucket,
    path,
    fsPath,
    minioClient,
  }
}
export async function uploadFile(fsPath:string, isDirectory = false) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)

  return new Promise((res, rej) => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.multiple = true
    fileInput.webkitdirectory = isDirectory

    fileInput.onchange = async () => {
      const promises = Array.from(fileInput?.files ?? { length: 0 })
        .map((file) => new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = async () => {
            const buffer = new Uint8Array(reader.result as ArrayBuffer)

            if (file) {
              // FIXME: change to use REAL Buffer, not Uint8Array. And restore minio.js
              minioClient.putObject(bucket, `${path}${!isDirectory ? file.name : file.webkitRelativePath}`, buffer as Buffer, { 'Content-Type': file.type })
                .then(() => {
                  resolve(true)
                }).catch((e1) => {
                  reject(e1)
                })
            }
          }
          reader.readAsArrayBuffer(file)
        }))

      Promise.all(promises).then(() => {
        res(true)
      }).catch((e) => {
        rej(e)
      })
    }
    fileInput.click()
  })
}

export async function newFile(fsPath: string) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)
  // FIXME: change another mime lib which does't use path
  // const type = mime.lookup(fsPath)
  const type = mime.getType(fsPath)

  await minioClient.putObject(bucket, `${path}`, '', type ? { 'Content-Type': type } : {})
}

export async function saveTextFile(
  fsPath:string,
  text:string,
) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)
  minioClient.putObject(bucket, path, text, { 'Content-Type': 'text/plain' })
    .then(() => {
      console.log('Uploaded')
    }).catch((e1) => {
      console.log(e1)
    })
}

async function listObjects(
  minioClient:Minio.Client,
  bucket:string,
  path:string,
  recursive = false,
) {
  const stream = await minioClient.extensions.listObjectsV2WithMetadata(bucket, path, recursive)
  const objs = await new Promise<Array<Minio.BucketItemWithMetadata>>((resolve, reject) => {
    const objectsListTemp: Array<Minio.BucketItemWithMetadata> = []
    stream.on('data', (obj) => objectsListTemp.push(obj))
    stream.on('error', reject)
    stream.on('end', () => {
      resolve(objectsListTemp)
    })
  })
  return objs
}

type DiredFile = {
  name:string,
  type:string,
  displayName:string,
  prefix:string,
  metadata:Minio.ItemBucketMetadata
  // size:number,
  // lastModified:string,
}

export async function dir(fsPath:string, recursive = false) :Promise<Array<DiredFile>> {
  const {
    bucket, path, minioClient, fsPath: linkFilePath,
  } = await resolvePath(fsPath)

  const objs = await listObjects(minioClient, bucket, path, recursive)
  return objs.map((obj) => {
    if (obj.name) {
      if (obj.name.match(/!\[[^]+]\.s3/)) {
        return {
          // ...obj,
          name: obj.name,
          type: 'remote-folder',
          displayName: obj.name.split('/').pop(),
          prefix: `/${obj.name}/`,
          metadata: obj.metadata,
        } as DiredFile
      }

      return {
        // ...obj,
        name: obj.name && `${linkFilePath}${obj.name}`,
        type: 'file',
        displayName: obj.name.split('/').pop(),
        metadata: obj.metadata,
      } as DiredFile
    }
    if (obj.prefix) {
      return {
        // ...obj,
        prefix: obj.prefix && `${linkFilePath}${obj.prefix}`,
        displayName: obj.prefix && obj.prefix.replace(/\/$/, '').replace(/^.*\//, ''),
        type: 'folder',
        metadata: obj.metadata,
      } as DiredFile
    }

    return {
      name: obj.name,
      type: 'unknown',
      displayName: obj.name,
      metadata: obj.metadata,

    } as DiredFile
  })
}

export async function getFile(fsPath:string) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)

  const stream = await minioClient.getObject(bucket, path)

  return new Promise<Blob>((resolve, reject) => {
    const chunks: Array<Uint8Array> = []
    stream.on('error', (e) => {
      reject(e)
    })
    stream.on('data', (chunk) => {
      // console.log(chunk)
      chunks.push(chunk)
    })
    stream.on('end', () => {
      resolve(new Blob(chunks, { }))
    })
  })
}

export async function getFileAsText(fsPath:string): Promise<string> {
  const object = await getFile(fsPath)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.readAsText(object)
  })
}

export async function getStat(fsPath:string) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)
  return new Promise((resolve, reject) => {
    minioClient.statObject(bucket, path, (err, stat) => {
      if (err) {
        reject(err)
      } else {
        resolve(stat)
      }
    })
  })
}
export async function removeFile(
  fsPath:string,
) {
  // debugger
  const { bucket, path, minioClient } = await resolvePath(fsPath)
  return minioClient.removeObject(bucket, path)
}

// TODO: cross bucket copy
export async function copyFile(fsPath:string, newFsPath:string) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)
  const { bucket: newBucket, path: newPath } = await resolvePath(newFsPath)
  const conds = new minio.CopyConditions()
  return new Promise((resolve, reject) => {
    minioClient.copyObject(newBucket, newPath, `${bucket}/${path}`, conds, (err, etag) => {
      if (err) {
        reject(err)
      } else {
        resolve(etag)
      }
    })
  })
}

// TODO: recursive delete all linked files
export async function removeDir(fsPath:string) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)

  const objs = await listObjects(minioClient, bucket, path, true)

  return minioClient.removeObjects(bucket, objs.map((o) => o.name))
}

export async function renameFile(fsPath:string, newFsPath:string) {
  return copyFile(fsPath, newFsPath).then(() => removeFile(fsPath))
}
