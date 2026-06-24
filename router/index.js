import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../src/components/AppMain.vue'),
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('../src/components/SearchPage.vue'),
    },
    {
        path: '/my-list',
        name: 'MyList',
        component: () => import('../src/components/MyList.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/series',
        name: 'Series',
        component: () => import('../src/components/Series.vue'),
    },
    {
        path: '/film',
        name: 'Film',
        component: () => import('../src/components/Film.vue'),
    },
    {
        path: '/person/:id',
        name: 'PersonDetail',
        component: () => import('../src/components/PersonDetail.vue'),
    },
    {
        path: '/account',
        name: 'Account',
        component: () => import('../src/components/AccountPage.vue'),
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('../src/components/ResetPasswordPage.vue'),
        meta: { bare: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        // Torna sempre in cima ad ogni navigazione
        return { top: 0, left: 0, behavior: 'instant' };
    },
});

// /my-list è sempre raggiungibile; se l'utente non è loggato,
// MyList.vue mostra la schermata di accesso richiesto anziché un redirect silenzioso.

export default router;
