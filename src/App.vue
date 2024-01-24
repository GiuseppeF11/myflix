<script>
import AppHeader from './components/AppHeader.vue';
import AppMain from './components/AppMain.vue';
import AppFooter from './components/AppFooter.vue';
import SingleMovie from './components/SingleMovie.vue';
import axios from 'axios';
import {store} from './store';

export default {
    data() {
        return {
            store
        };
    },
    components: {
        AppHeader,
        AppMain,
        AppFooter,
        SingleMovie,
    },  
    methods: {

        getApiMovie() {
            axios
            .get(this.store.movieUrl, {
                params: {
                    api_key: this.store.apiKey,
                    query: this.store.searchMovie.length > 0 ? this.store.searchMovie : null,
                    
                }
            })
            .then((response) => {
                console.log(response)
            });
        },

        /* getApiSerieTv() {
            axios
            .get(this.store.tvUrl, {
                params: {
                    api_key: this.store.apiKey,
                    TvSeries: this.store.searchTvSeries.length > 0 ? this.store.searchtvSeries : null,
                }
            })
            .then((response) => {
                console.log(response)
            });
        } */

    },
    mounted() {
        
        this.getApiMovie()

        /* this.getApiSerieTv() */
    }
}
</script>

<template>
    <h1>
        Boolfix
    </h1>

    <AppHeader @performSearch="getApiMovie()" />

    <AppMain />

    <AppFooter />
</template>

<style lang="scss">
@use "assets/scss/main" as *;
@import "assets/scss/partials/reset";
</style>
