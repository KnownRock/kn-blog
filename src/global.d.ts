import Minio from 'minio'

declare global {
  type FileInfo = {
    name:string,
    type:string,
    displayName:string,
    prefix:string,
    metadata:Minio.ItemBucketMetadata
    // size:number,
    // lastModified:string,
  }
}
declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_APP_CARD_MEDIA_HEIGHT: string,
    readonly VITE_APP_S3_BUCKET: string,
    readonly VITE_APP_S3_ACCESS_KEY: string,
    readonly VITE_APP_S3_SECRET_KEY: string,
    readonly VITE_APP_S3_ENDPOINT: string,
    readonly VITE_APP_S3_PORT: string,
  }
}
