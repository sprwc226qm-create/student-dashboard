import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/ai': {
          target: 'https://api.deepseek.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ai/, '/v1'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.VITE_DEEPSEEK_API_KEY) {
                proxyReq.setHeader('Authorization', `Bearer ${env.VITE_DEEPSEEK_API_KEY}`)
              }
            })
          },
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-echarts': ['echarts'],
            'vendor-element-plus': ['element-plus'],
            'vendor-vue': ['vue', 'vue-router', 'pinia'],
          },
        },
      },
    },
  }
})
