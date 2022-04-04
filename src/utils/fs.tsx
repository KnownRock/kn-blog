import Minio from 'minio'

import mime from 'mime-types'
// move to global script to use minio sdk in vite
// TODO: make it lazy load
declare const minio: typeof Minio

const minioClient = new minio.Client({
  endPoint: '192.168.199.252',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
})

export async function resolvePath(path: string) {
  return {
    bucket: 'private',
    path,
  }
}
export async function uploadFile(fsPath:string) {
  const { bucket, path } = await resolvePath(fsPath)

  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.onchange = async (e) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer)

      const file = fileInput?.files?.[0]
      if (file) {
        // FIXME: change to use REAL Buffer, not Uint8Array. And restore minio.js
        minioClient.putObject(bucket, `${path}${file.name}`, buffer as Buffer, { 'Content-Type': file.type })
          .then(() => {
            console.log('Uploaded')
          }).catch((e1) => {
            console.log(e1)
          })
      }
    }
    if (fileInput?.files?.[0]) {
      reader.readAsArrayBuffer(fileInput.files[0])
    }
  }
  fileInput.click()
}

export async function newFile(fsPath: string) {
  const { bucket, path } = await resolvePath(fsPath)
  const type = mime.lookup(fsPath)

  minioClient.putObject(bucket, `${path}`, '', type ? { 'Content-Type': type } : {})
}

export async function saveTextFile(
  fsPath:string,
  text:string,
) {
  const { bucket, path } = await resolvePath(fsPath)
  minioClient.putObject(bucket, path, text, { 'Content-Type': 'text/plain' })
    .then(() => {
      console.log('Uploaded')
    }).catch((e1) => {
      console.log(e1)
    })
}

export async function dir(fsPath:string, recursive = false) {
  const { bucket, path } = await resolvePath(fsPath)
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

export async function getFile(fsPath:string) {
  const { bucket, path } = await resolvePath(fsPath)

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

export async function getStat(fsPath:string) {
  const { bucket, path } = await resolvePath(fsPath)
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
  const { bucket, path } = await resolvePath(fsPath)
  return minioClient.removeObject(bucket, path)
}

export async function copyFile(fsPath:string, newFsPath:string) {
  const { bucket, path } = await resolvePath(fsPath)
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
  const objects = await dir(fsPath, true)
  const { bucket, path } = await resolvePath(fsPath)
  return minioClient.removeObjects(bucket, objects.map((o) => o.name))
}

export async function renameFile(fsPath:string, newFsPath:string) {
  return copyFile(fsPath, newFsPath).then(() => removeFile(fsPath))
}
