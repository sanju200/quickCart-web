import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native/Libraries/Utilities/codegenNativeComponent': path.resolve(__dirname, 'src/shims/codegenNativeComponent.js'),
      'react-native': 'react-native-web',
    },
    extensions: [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: [
        '.web.js',
        '.web.jsx',
        '.web.ts',
        '.web.tsx',
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
      ],
      loader: {
        '.js': 'jsx',
      },
    },
  },
  define: {
    __DEV__: process.env.NODE_ENV !== 'production',
    global: 'window',
  },
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/cart': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/categories': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/product': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/order': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/offer': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
