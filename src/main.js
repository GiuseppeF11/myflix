import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '../router' // Importa il router
import { useAuthStore } from './stores/auth.js'
import { useFavoritesStore } from './stores/favorites.js'

const app = createApp(App)
app.use(createPinia())
app.use(router) // Usa il router

// Inizializziamo la sessione e i preferiti prima del mount, così il route
// guard di /my-list valuta lo stato di autenticazione corretto.
;(async () => {
  await useAuthStore().init()
  await useFavoritesStore().load()
  app.mount('#app')
})()
