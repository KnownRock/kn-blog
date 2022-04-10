export async function uploadFileAsDataUrl() {
  return new Promise<string>((resolve, reject) => {
    const file = document.createElement('input')
    file.type = 'file'

    file.onchange = async () => {
      if (file?.files?.[0]) {
        const reader = new FileReader()
        reader.readAsDataURL(file.files[0])
        reader.onload = async () => {
          const dataUrl = reader.result as string
          resolve(dataUrl)
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

export async function uploadFileAsBase64() {
  throw new Error('not implemented')
}
