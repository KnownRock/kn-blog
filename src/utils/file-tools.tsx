import mime from 'mime'

export async function uploadFileAsDataUrlWithFileName() {
  return new Promise<{
    fileName: string,
    dataUrl: string,
  }>((resolve, reject) => {
    const file = document.createElement('input')
    file.type = 'file'

    file.onchange = async () => {
      if (file?.files?.[0]) {
        const reader = new FileReader()
        reader.readAsDataURL(file.files[0])
        reader.onload = async () => {
          const dataUrl = reader.result as string
          resolve({
            fileName: file?.files?.[0]?.name as string,
            dataUrl,
          })
        }
        reader.onerror = (err) => {
          reject(err)
        }
      } else {
        reject(new Error('file is null'))
      }
    }
    file.click()
  })
}

export async function convertFileToDataUrlWithFileName(file:File) : Promise<{
  fileName: string,
  dataUrl: string,
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const dataUrl = reader.result as string
      resolve({
        fileName: file.name,
        dataUrl,
      })
    }
    reader.onerror = (err) => {
      reject(err)
    }
  })
}

export async function convertFilesToDataUrlWithFileName(files:File[]) : Promise<{
  fileName: string,
  dataUrl: string,
}[]> {
  return Promise.all(
    Array.from(files).map(async (file) => convertFileToDataUrlWithFileName(file)),
  )
}

export async function convertBlobsToDataUrlWithFileName(blobs:Blob[]): Promise<{
  fileName: string,
  dataUrl: string,
}[]> {
  return convertFilesToDataUrlWithFileName(
    blobs.map((blob, index) => new File([blob], `${index}.${mime.getExtension(blob.type)}`)),
  )
}

export async function uploadFileAsDataUrl() {
  return uploadFileAsDataUrlWithFileName().then(({ dataUrl }) => dataUrl)
}

export async function uploadFileAsBase64() {
  throw new Error('not implemented')
}
