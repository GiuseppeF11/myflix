import { createRouter, createWebHistory } from 'vue-router';
import Home from '../src/components/AppMain.vue';
import MyList from '../src/components/MyList.vue';
import Series from '../src/components/Series.vue';
import Film from '../src/components/Film.vue';

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
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
