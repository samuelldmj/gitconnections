import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  base: process.env.NODE_ENV === 'production' ? '/gitconnections/' : '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    preview: {
      port: 4173,
      strictPort: true,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  },
  build: {
    assetsDir: './',
    rollupOptions: {
      output: {
        assetFileNames: '[name].[ext]'
      }
    }
  }
});