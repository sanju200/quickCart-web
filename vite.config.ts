import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  const API_TARGET = env.VITE_API_TARGET || 'https://quickcart-backend-production-e087.up.railway.app';

  /**
   * Refined Proxy Logic:
   * Only proxy requests that are NOT trying to load the main page (HTML).
   * This prevents "404 Cannot GET /" errors on refresh.
   */
  const proxyOptions = {
    target: API_TARGET,
    changeOrigin: true,
    secure: false,
    bypass: (req: any, res: any) => {
      // If the request accepts HTML, it's likely a browser page refresh.
      // We should return /index.html and let React handle the routing.
      if (req.headers.accept?.includes('text/html')) {
        return '/index.html';
      }
      
      // Also check if the URL looks like a page route (no file extension)
      // but is NOT one of our API paths.
      // This is a safety check for some browsers.
    }
  };

  return {
    plugins: [react()],
    base: "/",
    resolve: {
      alias: {
        'react-native/Libraries/Utilities/codegenNativeComponent': path.resolve(__dirname, 'src/shims/codegenNativeComponent.js'),
        'react-native': 'react-native-web',
      },
      extensions: [
        '.web.js', '.web.jsx', '.web.ts', '.web.tsx',
        '.js', '.jsx', '.ts', '.tsx',
      ],
    },
    optimizeDeps: {
      esbuildOptions: {
        resolveExtensions: [
          '.web.js', '.web.jsx', '.web.ts', '.web.tsx',
          '.js', '.jsx', '.ts', '.tsx',
        ],
        loader: {
          '.js': 'jsx',
        },
      },
    },
    define: {
      __DEV__: process.env.NODE_ENV !== 'production',
      global: 'window',
      'process.env': env
    },
    server: {
      historyApiFallback: true, // Key fix for SPA refreshes
      proxy: {
        '/auth': proxyOptions,
        '/cart': proxyOptions,
        '/categories': proxyOptions,
        '/product': proxyOptions,
        '/order': proxyOptions,
        '/offer': proxyOptions,
        '/admin': proxyOptions,
        '/users': proxyOptions,
        '/api': proxyOptions,
      },
    },
  }
})
