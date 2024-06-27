import { createApp } from 'vue'
import App from './App.vue'
import * as bootstrap from 'bootstrap'
import router from '../router' // Importa il router
import 'jquery';


const app = createApp(App)
app.use(router) // Usa il router
app.mount('#app')
