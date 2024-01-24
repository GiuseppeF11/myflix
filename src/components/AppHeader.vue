<script>
import {store} from '../store'
import axios from 'axios';
import SingleMovie from './SingleMovie.vue'
export default {
    data() {
        return {
            store,
            axios
        };
    },
    components: {
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
                console.log(response.data.results[0].title) // RESTITUISCE IL TITOLO DEL PRIMO ELEMENTO DELL'ARRAY 
            });
        },
},
                                                        //       RIPRENDERE DA QUIIII!!!!!
}
</script>

<template>
    <header>
        <div class="container">
            <form @submit.prevent="$emit('performSearch')">
                <div class="row">
                    <div class="col">
                        <input
                            v-model="store.searchMovie"
                            type="text"
                            class="form-control"
                            placeholder="Search movie"
                            aria-label="Search movie">
                    </div>
                    <div class="col-auto">
                        <button type="submit" class="btn btn-primary mb-3">
                            Search
                        </button>
                    </div>
                </div>

                <div class="container movie-list">
                    <SingleMovie v-for="(elem, i) in store.movies" :key="i" :movie="elem"/>
                    <button @click="getApiMovie()">PER CAPIRE CHE PRENDIAMO</button>
                </div>
            </form>
        </div>
    </header>
</template>

<style lang="scss" scoped>
.movie-list {
    min-height: 50vh;
    background-color: rgba(108, 21, 21, 0.67);
}
</style>
