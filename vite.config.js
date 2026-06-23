import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    server: {
      proxy: {
        // In dev il proxy Vite aggiunge la api_key lato server, mai nel bundle.
        '/api/proxy': {
          target: 'https://api.themoviedb.org/3',
          changeOrigin: true,
          rewrite: (path) => {
            // path include la querystring: "/api/proxy?path=movie/popular&language=it-IT"
            const [, search] = path.split('?')
            const params = new URLSearchParams(search || '')
            const tmdbPath = params.get('path') || ''
            params.delete('path')
            params.set('api_key', env.TMDB_API_KEY)
            return '/' + tmdbPath + '?' + params.toString()
          },
        },
      },
    },
  }
})
