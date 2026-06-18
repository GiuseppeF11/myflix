import { createRouter, createWebHistory } from 'vue-router';
import Home               from '../src/components/AppMain.vue';
import SearchPage         from '../src/components/SearchPage.vue';
import MyList             from '../src/components/MyList.vue';
import Series             from '../src/components/Series.vue';
import Film               from '../src/components/Film.vue';
import PersonDetail       from '../src/components/PersonDetail.vue';
import ResetPasswordPage  from '../src/components/ResetPasswordPage.vue';
import AccountPage        from '../src/components/AccountPage.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/search',
        name: 'Search',
        component: SearchPage,
    },
    {
        path: '/my-list',
        name: 'MyList',
        component: MyList,
        meta: { requiresAuth: true },
    },
    {
        path: '/series',
        name: 'Series',
        component: Series,
    },
    {
        path: '/film',
        name: 'Film',
        component: Film,
    },
    {
        path: '/person/:id',
        name: 'PersonDetail',
        component: PersonDetail,
    },
    {
        path: '/account',
        name: 'Account',
        component: AccountPage,
    },
    {
        // Destinazione del link "Recupera password" inviato via email da Supabase.
        // meta.bare = true → App.vue nasconde header, bottom-nav e ScrollToTop.
        path: '/reset-password',
        name: 'ResetPassword',
        component: ResetPasswordPage,
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
