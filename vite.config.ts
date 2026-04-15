import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  const API_TARGET = env.VITE_API_TARGET || 'https://quickcart-backend-production-e087.up.railway.app';

  const proxyOptions = {
    target: API_TARGET,
    changeOrigin: true,
    bypass: (req: any) => { 
      if (req.headers.accept?.includes('text/html')) return '/index.html'; 
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
      // This makes the env variables available in your code as well
      'process.env': env
    },
    server: {
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
