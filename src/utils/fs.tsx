import Minio from 'minio'

// import mime from 'mime-types'
import mime from 'mime'
// move to global script to use minio sdk in vite
// TODO: make it lazy load
declare const minio: typeof Minio

const minioClient1 = new minio.Client({
  // endPoint: '192.168.199.252',
  endPoint: '127.0.0.1',
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

async function getFileRaw(bucket:string, path:string, minioClient:Minio.Client) {
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

async function getFileAsTextRaw(
  bucket:string,
  path:string,
  minioClient:Minio.Client,
): Promise<string> {
  const object = await getFileRaw(bucket, path, minioClient)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = reject
    reader.readAsText(object)
  })
}

export async function resolvePath(path: string, fsPath = '', bucket = 'private', minioClient = minioClient1): Promise<ResolvedPath> {
  const paths = path.split('/')
  let linkFileIndex = -1

  paths.some((p, index) => {
    if (p.match(/^[^.]+.s3$/)) {
      linkFileIndex = index

      return true
    }
    return false
  })
  // TODO: recursive link file find
  if (linkFileIndex !== -1 && linkFileIndex !== paths.length - 1) {
    const linkFilePath = paths.slice(0, linkFileIndex + 1).join('/')
    const linkFileText = await getFileAsTextRaw(bucket, linkFilePath, minioClient)
    const linkObject = JSON.parse(linkFileText)
    const restPath = paths.slice(linkFileIndex + 1).join('/')

    return resolvePath(restPath, `${fsPath + linkFilePath}/`, linkObject.bucket, minioClient)
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
  return minioClient.putObject(bucket, path, text, { 'Content-Type': 'text/plain' })
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

export async function dir(fsPath:string, recursive = false) :Promise<Array<FileInfo>> {
  const {
    bucket, path, minioClient, fsPath: linkFilePath,
  } = await resolvePath(fsPath)

  const objs = await listObjects(minioClient, bucket, path, recursive)

  return objs.map((obj) => {
    if (obj.name) {
      if (obj.name.match(/^[^.]+.s3$/)) {
        const displayNameRaw = obj.name.split('/').pop() ?? ''
        const displayName = displayNameRaw
        // displayNameRaw.match(/([^.]+).s3/)?.[1] ?? displayNameRaw

        return {
          name: `${linkFilePath}${obj.name}`,
          type: 'remote-folder',
          displayName: `${displayName}`,
          prefix: `${linkFilePath}${obj.name}/`,
          metadata: obj.metadata,
        } as FileInfo
      }

      return {
        // ...obj,
        name: obj.name && `${linkFilePath}${obj.name}`,
        type: 'file',
        displayName: obj.name.split('/').pop(),
        metadata: obj.metadata,
      } as FileInfo
    }
    if (obj.prefix) {
      return {
        // ...obj,
        name: obj.prefix.replace(/\/$/, ''),
        prefix: obj.prefix && `${linkFilePath}${obj.prefix}`,
        displayName: obj.prefix && obj.prefix.replace(/\/$/, '').replace(/^.*\//, ''),
        type: 'folder',
        metadata: obj.metadata,
      } as FileInfo
    }

    return {
      name: obj.name,
      type: 'unknown',
      displayName: obj.name,
      metadata: obj.metadata,
      prefix: '',
    } as FileInfo
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

export async function getFileAsDataUrl(fsPath:string):Promise<string> {
  const stream = await getFile(fsPath)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(stream)
  })
}

export async function getFileAsText(fsPath:string): Promise<string> {
  const object = await getFile(fsPath)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = reject
    reader.readAsText(object)
  })
}

export async function stat(fsPath:string) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)
  return new Promise((resolve, reject) => {
    minioClient.statObject(bucket, path, (err, s) => {
      if (err) {
        reject(err)
      } else {
        resolve(s)
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

export async function renameFolder(fsPath:string, newFsPath:string) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)
  const {
    bucket: newBucket,
    path: newPath,
    minioClient: newMinioClient,
  } = await resolvePath(newFsPath)
  const objects = await listObjects(minioClient, bucket, path, true)
  // TODO: judge if two clients are the same config
  return Promise.all(objects.map((obj) => {
    const newObjName = obj.name.replace(new RegExp(`^${path}`), newPath)
    return renameFile(`${obj.name}`, `${newObjName}`)
  }))
}

export async function isExist(newName:string) {
  const url = newName.startsWith('/') ? newName : `/${newName}`
  const fatherFolder = url.replace(/\/[^/]+$/, '')
  return dir(fatherFolder).then((objects) => objects.some((o) => o.name === newName))
}
