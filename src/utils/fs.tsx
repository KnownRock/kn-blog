import Minio from 'minio'
import mime from 'mime'

import hash from 'crypto-js/sha256'
// in order use minio in vite, bundle by browserify
// please download from https://github.com/KnownRock/kn-blog-minio-lib
import 'kn-blog-minio-sdk'

declare const minio: typeof Minio

const defaultConfig = {
  endPoint: import.meta.env.VITE_APP_S3_ENDPOINT, // '127.0.0.1',
  port: +import.meta.env.VITE_APP_S3_PORT, // 9000,
  useSSL: import.meta.env.VITE_APP_S3_USE_SSL === 'true',
  accessKey: import.meta.env.VITE_APP_S3_ACCESS_KEY, // 'minioadmin',
  secretKey: import.meta.env.VITE_APP_S3_SECRET_KEY, // 'minioadmin',

  bucket: import.meta.env.VITE_APP_S3_BUCKET, // 'private',
}

type MinioConfig = typeof defaultConfig

// let rootBucket = defaultConfig.bucket
let rootMinioConfig = defaultConfig

const clientCache:{
  [key: string]: Minio.Client
} = {}

function getClient(config: Minio.ClientOptions) {
  const key = hash(`${config.endPoint}:${config.useSSL}:${config.port}:${config.accessKey}:${config.secretKey}`).toString()
  if (clientCache[key]) {
    return clientCache[key]
  }
  clientCache[key] = new minio.Client(config)
  return clientCache[key]
}

export async function setConfig(config:typeof defaultConfig) {
  // rootBucket = config.bucket
  rootMinioConfig = config
}

type ResolvedPath = {
  bucket:string,
  path:string,
  fsPath:string,
  prefixPath:string,
  minioClient :Minio.Client
}

export async function testConfig(config:typeof defaultConfig) {
  const minioClient = new minio.Client(config)
  try {
    return await minioClient.bucketExists(config.bucket)
  } catch (e) {
    return new Promise((resolve) => {
      resolve(false)
    })
  }
}

async function getFileRaw(bucket:string, path:string, minioClient:Minio.Client) {
  const stream = await minioClient.getObject(bucket, path)

  return new Promise<Blob>((resolve, reject) => {
    const chunks: Array<Uint8Array> = []
    stream.on('error', (e) => {
      reject(e)
    })
    stream.on('data', (chunk) => {
      chunks.push(chunk)
    })
    stream.on('end', () => {
      resolve(new Blob(chunks, { }))
    })
  })
}

const rawTextCache :{
  [key: string]: string
} = {}
async function getFileAsTextRawWithCache(
  path:string,
  bucket:string,
  minioClient:Minio.Client,
  rawPath:string,
): Promise<string> {
  if (rawTextCache[rawPath]) {
    return rawTextCache[rawPath]
  }

  const object = await getFileRaw(bucket, path, minioClient)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      rawTextCache[rawPath] = text

      resolve(text)
    }
    reader.onerror = reject
    reader.readAsText(object)
  })
}

export async function resolvePath(path: string, fsPath = '', prefixPath = '', parMinioConfig: MinioConfig | undefined = undefined, rawPath = path): Promise<ResolvedPath> {
  const config = parMinioConfig || rootMinioConfig
  const minioClient = getClient(config)
  const { bucket } = config

  const paths = path.split('/')
  let linkFileIndex = -1

  paths.some((p, index) => {
    if (p.endsWith('.s3')) {
      linkFileIndex = index

      return true
    }
    return false
  })
  // TODO: recursive link file find
  if (linkFileIndex !== -1 && linkFileIndex !== paths.length - 1) {
    const linkFilePath = paths.slice(0, linkFileIndex + 1).join('/')
    const linkFileText = await getFileAsTextRawWithCache(linkFilePath, bucket, minioClient, rawPath)
    const linkObject = JSON.parse(linkFileText)
    const restPath = paths.slice(linkFileIndex + 1).join('/')

    const newConfig = ({
      ...rootMinioConfig,
      ...linkObject,
    })

    const additionalPath:string = linkObject.path ?? ''
    return resolvePath(`${additionalPath}${restPath}`, `${fsPath + linkFilePath}/`, additionalPath, newConfig, rawPath)
  }
  return {
    bucket,
    path,
    fsPath,
    prefixPath,
    minioClient,
  }
}

// only for dropzone
export async function uploadDropedFileList(fsPath:string, fileList:({ path:string } & File)[]) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)

  const promises = Array.from(fileList ?? { length: 0 })
    .map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async () => {
        const buffer = new Uint8Array(reader.result as ArrayBuffer)

        if (file) {
          // FIXME: change to use REAL Buffer, not Uint8Array. And restore minio.js
          minioClient.putObject(bucket, `${path}${file.path}`, Buffer.from(buffer), { 'Content-Type': file.type })
            .then(() => {
              resolve(true)
            }).catch((e1) => {
              reject(e1)
            })
        }
      }
      reader.readAsArrayBuffer(file)
    }))

  return Promise.all(promises)
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
              minioClient.putObject(
                bucket,
                `${path}${!isDirectory ? file.name : file.webkitRelativePath}`,
                Buffer.from(buffer),
                { 'Content-Type': file.type },
              )
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

export async function getMinioClient() {
  return getClient(rootMinioConfig)
}

// TODO: move it page
export async function saveTextToDefaultBucket(
  fsPath:string,
  text:string,
) {
  const minioClient = await getMinioClient()
  const { bucket } = defaultConfig
  return minioClient.putObject(bucket, fsPath, text, { 'Content-Type': 'text/plain' })
}

export async function saveText(
  fsPath:string,
  text:string,
) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)
  return minioClient.putObject(bucket, path, text, { 'Content-Type': 'text/plain' })
}

export async function saveDataUrl(
  fsPath:string,
  dataUrl:string,
) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)

  if (!dataUrl) return minioClient.putObject(bucket, path, '', { 'Content-Type': 'text/plain' })

  const byteString = atob(dataUrl.split(',')[1])
  const fileType = dataUrl.match(/^data:([^;]+)/)?.[1]
  const ab = new ArrayBuffer(byteString.length)
  const buffer = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i += 1) {
    buffer[i] = byteString.charCodeAt(i)
  }
  return minioClient.putObject(bucket, path, Buffer.from(buffer), { 'Content-Type': fileType })
}

export async function saveDataUrlToDefaultBucket(
  fsPath:string,
  dataUrl:string,
) {
  const minioClient = await getMinioClient()
  const { bucket } = defaultConfig

  const byteString = atob(dataUrl.split(',')[1])
  const fileType = dataUrl.match(/^data:([^;]+)/)?.[1]
  const ab = new ArrayBuffer(byteString.length)
  const buffer = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i += 1) {
    buffer[i] = byteString.charCodeAt(i)
  }

  return minioClient.putObject(bucket, fsPath, Buffer.from(buffer), { 'Content-Type': fileType })
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

export async function dir(fsPathRaw:string, recursive = false) :Promise<Array<FileInfo>> {
  const fsPathWithoutStart = fsPathRaw.replace(/^\//, '')
  const fsPath = fsPathWithoutStart.endsWith('/') ? fsPathWithoutStart : `${fsPathWithoutStart}/`

  const {
    bucket, path, minioClient, fsPath: linkFilePath, prefixPath,
  } = await resolvePath(fsPath)

  const objs = await listObjects(minioClient, bucket, path, recursive)

  return objs.map((obj) => {
    if (obj.name) {
      if (obj.name.endsWith('.s3')) {
        const displayNameRaw = obj.name.split('/').pop() ?? ''
        const displayName = displayNameRaw
        // displayNameRaw.match(/([^.]+).s3/)?.[1] ?? displayNameRaw

        return {
          name: `${linkFilePath}${obj.name.replace(new RegExp(`^${prefixPath}`), '')}`,
          type: 'remote-folder',
          displayName: `${displayName}`,
          prefix: `${linkFilePath}${obj.name}/`,
          metadata: obj.metadata,
        } as FileInfo
      }

      return {
        // ...obj,
        name: obj.name && `${linkFilePath}${obj.name.replace(new RegExp(`^${prefixPath}`), '')}`,
        type: 'file',
        displayName: obj.name.split('/').pop(),
        metadata: obj.metadata,
      } as FileInfo
    }
    if (obj.prefix) {
      return {
        // ...obj,
        name: `${linkFilePath}${obj.prefix.replace(/\/$/, '')}`,
        prefix: obj.prefix && `${linkFilePath}${obj.prefix.replace(new RegExp(`^${prefixPath}`), '')}`,
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

export async function stat(fsPath:string):Promise<Minio.BucketItemStat> {
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

export async function copyFile(fsPath:string, newFsPath:string) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)
  // TODO: copy file between two different clients.
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

export async function copyFolder(fsPath:string, newFsPath:string) {
  const { bucket, path, minioClient } = await resolvePath(fsPath)
  const {
    bucket: newBucket,
    path: newPath,
    // minioClient: newMinioClient,
  } = await resolvePath(newFsPath)
  const objects = await listObjects(minioClient, bucket, path, true)
  const conds = new minio.CopyConditions()
  // TODO: judge if two clients are the same config
  return Promise.all(objects.map((obj) => {
    const newObjName = obj.name.replace(new RegExp(`^${path}`), newPath)
    // return copyFile(`${obj.name}`, `${newObjName}`)
    return new Promise((resolve, reject) => {
      minioClient.copyObject(newBucket, newObjName, `${bucket}/${obj.name}`, conds, (err, etag) => {
        if (err) {
          reject(err)
        } else {
          resolve(etag)
        }
      })
    })
  }))
}

// TODO: recursive delete all linked files maybe?
export async function removeDir(fsPath:string) {
  const { bucket, path, minioClient } = await resolvePath(fsPath.endsWith('/') ? fsPath : `${fsPath}/`)

  const objs = await listObjects(minioClient, bucket, path, true)

  return minioClient.removeObjects(bucket, objs.map((o) => o.name))
}

export async function renameFile(fsPath:string, newFsPath:string) {
  return copyFile(fsPath, newFsPath).then(() => removeFile(fsPath))
}

export async function renameFolder(fsPath:string, newFsPath:string) {
  return copyFolder(fsPath, newFsPath).then(() => removeDir(fsPath))
}

export async function isExist(newName:string) {
  const url = newName.startsWith('/') ? newName : `/${newName}`
  const fatherFolder = url.replace(/(?<=\/)[^/]+$/, '')
  return dir(fatherFolder).then((objects) => objects.some((o) => o.name === newName))
}
