<script>
import AppHeader from './components/AppHeader.vue';
import AppMain from './components/AppMain.vue';
import axios from 'axios';
import {store} from './store.js';

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
    methods: {

        search() {
            axios
                .get(this.store.movieUrl,  {
                    params: {
                        api_key: this.store.apiKey,
                        query: this.store.searchText
                    }
                })
                .then((response) => {
                    console.log(response);
                    this.store.movies = response.data.results;
                })

                axios
                .get(this.store.seriesUrl,  {
                    params: {
                        api_key: this.store.apiKey,
                        query: this.store.searchText
                    }
                })
                .then((response) => {
                    console.log(response);
                    this.store.series = response.data.results;
                })
        },

    },
}
</script>

<template>
    <h1>
        Boolfix
    </h1>

    <AppHeader @performSearch="search()"/>

    <AppMain />

</template>

<style lang="scss">
@use "assets/scss/main" as *;
@import "assets/scss/partials/reset";
</style>
