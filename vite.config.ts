import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 23030,
  },
  // https://dev.to/0xbf/vite-module-path-has-been-externalized-for-browser-compatibility-2bo6
  
  resolve:{
    alias: {
      path: "path-browserify",
    },
  }
  

})
