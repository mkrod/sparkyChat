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
      key: readFileSync(path.resolve(__dirname, "../server/keys/key.pem")),
      cert: readFileSync(path.resolve(__dirname, "../server/keys/cert.pem")),
    },
    port: 5175,
  },
});