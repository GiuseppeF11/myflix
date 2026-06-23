import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    server: {
      proxy: {
        // In dev il proxy Vite aggiunge la api_key lato server, mai nel bundle.
        '/api/tmdb': {
          target: 'https://api.themoviedb.org/3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tmdb/, '') || '/',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const url = new URL('http://x' + proxyReq.path)
              url.searchParams.set('api_key', env.TMDB_API_KEY)
              proxyReq.path = url.pathname + url.search
            })
          },
        },
      },
    },
  }
})
