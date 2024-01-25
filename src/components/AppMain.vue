<script>
import {store} from '../store.js'
import SingleElement from './SingleElement.vue'

export default {
    data() {
        return {    
            store,
        };
    },
    components: {
        SingleElement,
    },  
    methods: {
    },
}
</script>

<template>
    <main>
        <h2>MOVIES</h2>
        <div>
            <ul>
                <li v-for="(movie, i) in this.store.movies" :key="i">
                    <SingleElement
                    :titleOrName="movie.title"
                    :originalTitleorName="movie.original_title"
                    :originalLanguage="movie.original_language"
                    :voteAverage="movie.vote_average"
                    />
                </li>
            </ul>
        </div>
        <hr>
        <h2>SERIES</h2>
        <div>
            <ul>
                <li v-for="(serie, i) in this.store.series" :key="i">
                    <SingleElement
                    :titleOrName="serie.name"
                    :originalTitleorName="serie.original_name"
                    :originalLanguage="serie.original_language"
                    :voteAverage="serie.vote_average"
                    />
                </li>
            </ul>
        </div>
    </main>
</template>

<style lang="scss" scoped>

img {
    width: 80px;
    height: 80px;
}
</style>
