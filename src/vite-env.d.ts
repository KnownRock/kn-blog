/// <reference types="vite/client" />

// https://vitejs.dev/guide/env-and-mode.html#env-files

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_S3_BUCKET: string,
  readonly VITE_APP_S3_ACCESS_KEY: string,
  readonly VITE_APP_S3_SECRET_KEY: string,
  readonly VITE_APP_S3_ENDPOINT: string,
  readonly VITE_APP_S3_PORT: string,
  readonly VITE_APP_S3_USE_SSL: string,
}
