import { createRouter, createWebHistory } from 'vue-router';
import Home from '../src/components/AppMain.vue'; // Verifica che questo percorso sia corretto
import MyList from '../src/components/MyList.vue'; // Utilizza 'vue' in minuscolo

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/my-list',
        name: 'MyList',
        component: MyList,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
