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
