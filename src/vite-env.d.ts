/// <reference types="vite/client" />

// https://vitejs.dev/guide/env-and-mode.html#env-files

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_CARD_MEDIA_HEIGHT: string,
  readonly VITE_APP_S3_URL: string,
  readonly VITE_APP_S3_BUCKET: string,
  readonly VITE_APP_S3_ACCESS_KEY_ID: string,
  readonly VITE_APP_S3_SECRET_ACCESS_KEY: string,
  readonly VITE_APP_S3_ENDPOINT: string,
  readonly VITE_APP_S3_PORT: string,

}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
