import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
import { readFileSync } from 'fs';

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  server: {
    https: {
      key: readFileSync(path.resolve(__dirname, "../server/keys/server.key")),
      cert: readFileSync(path.resolve(__dirname, "../server/keys/server.cert")),
    },
    port: 5175,
  },
  
});