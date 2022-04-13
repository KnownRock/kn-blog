import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pluginRewriteAll from 'vite-plugin-rewrite-all';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // resolve dot in url cause reload 404
    // https://github.com/vitejs/vite/issues/2245
    pluginRewriteAll()
  ],

  server: {
    port: 23030,
   
  },
  // https://dev.to/0xbf/vite-module-path-has-been-externalized-for-browser-compatibility-2bo6
  resolve:{
    alias: {
      path: "path-browserify",
    },
  },

  build:{
    // https://vitejs.dev/config/#build-config
    outDir: './main',
  }



})
