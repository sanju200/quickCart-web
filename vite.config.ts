import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
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
        target: 'https://quickcart-backend-production-e087.up.railway.app',
        changeOrigin: true,
        bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html'; }
      },
      '/cart': {
        target: 'https://quickcart-backend-production-e087.up.railway.app',
        changeOrigin: true,
        bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html'; }
      },
      '/categories': {
        target: 'https://quickcart-backend-production-e087.up.railway.app',
        changeOrigin: true,
        bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html'; }
      },
      '/product': {
        target: 'https://quickcart-backend-production-e087.up.railway.app',
        changeOrigin: true,
        bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html'; }
      },
      '/order': {
        target: 'https://quickcart-backend-production-e087.up.railway.app',
        changeOrigin: true,
        bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html'; }
      },
      '/offer': {
        target: 'https://quickcart-backend-production-e087.up.railway.app',
        changeOrigin: true,
        bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html'; }
      },
      '/admin': {
        target: 'https://quickcart-backend-production-e087.up.railway.app',
        changeOrigin: true,
        bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html'; }
      },
      '/users': {
        target: 'https://quickcart-backend-production-e087.up.railway.app',
        changeOrigin: true,
        bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html'; }
      },
      '/api': {
        target: 'https://quickcart-backend-production-e087.up.railway.app',
        changeOrigin: true,
        bypass: (req) => { if (req.headers.accept?.includes('text/html')) return '/index.html'; }
      },
    },
  },
})
