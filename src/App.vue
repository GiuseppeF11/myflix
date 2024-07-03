<script>
import AppHeader from './components/AppHeader.vue';
import AppMain from './components/AppMain.vue';
import axios from 'axios';
import { store } from './store.js';

export default {
    data() {
        return {
            store,
        };
    },
    components: {
        AppHeader,
        AppMain,
    },
    watch: {
        'store.searchText': 'search',
    },
    methods: {
        search() {
            if (this.store.searchText.trim() === '') {
                this.store.movies = [];
                this.store.series = [];
                return;
            }

            axios
                .get(this.store.movieUrl, {
                    params: {
                        api_key: this.store.apiKey,
                        query: this.store.searchText,
                        language: 'it-IT',
                        region: 'IT',
                    }
                })
                .then((response) => {
                    this.store.movies = response.data.results;
                    console.log(response.data.results);
                });

            axios
                .get(this.store.seriesUrl, {
                    params: {
                        api_key: this.store.apiKey,
                        query: this.store.searchText,
                        language: 'it-IT',
                        region: 'IT',
                    }
                })
                .then((response) => {
                    this.store.series = response.data.results;
                    console.log(response.data.results);
                });
        },
    },
};
</script>

<template>
    <body>
        
        <header>
            <AppHeader />
        </header>
        <main>
            <router-view></router-view>            
        </main>
    </body>
</template>

<style lang="scss">
@use "assets/scss/main" as *;
@import "assets/scss/partials/reset";

body {
    background-color: #1C1C1C ;
    color: white;
}
</style>
