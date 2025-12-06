import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { envInjectPlugin } from "./vite-plugin-env-inject"

const isProd = process.env.BUILD_MODE === 'prod'
export default defineConfig({
  plugins: [react(), envInjectPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  assetsInclude: ['**/*.json'],
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.json')) {
            return 'locales/[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        },
        manualChunks: (id) => {
          // Force Login component to be in separate chunk to avoid caching issues
          if (id.includes('Login')) {
            return 'login-v2';
          }
        }
      },
      external: ['mysql2', 'jsonwebtoken']
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    allowedHosts: true,
  }
})