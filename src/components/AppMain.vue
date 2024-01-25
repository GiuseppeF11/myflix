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
        <div class="container">
            <h2>FILM</h2>
            <div>
                <ul>
                    <div class="row row-cols-5 justify-content-around">
                        <li v-for="(movie, i) in this.store.movies" :key="i" class="col m-3">
                        <SingleElement
                            :titleOrName="movie.title"
                            :originalTitleorName="movie.original_title"
                            :originalLanguage="movie.original_language"
                            :voteAverage="movie.vote_average"
                            :poster="this.store.imgUrl + movie.poster_path"
                            :overview="this.store.overview + movie.overview"
                            />
                        </li>
                    </div>
                </ul>
            </div>
        </div>
        <hr>
        <div class="container">
            <h2>SERIES</h2>
            <div>
                <ul>
                    <div class="row row-cols-5 justify-content-around">
                        <li v-for="(serie, i) in this.store.series" :key="i" class="col m-3">
                        <SingleElement
                            :titleOrName="serie.title"
                            :originalTitleorName="serie.original_title"
                            :originalLanguage="serie.original_language"
                            :voteAverage="serie.vote_average"
                            :poster="this.store.imgUrl + serie.poster_path"
                            :overview="this.store.overview + serie.overview"
                            />
                        </li>
                    </div>
                </ul>
            </div>
        </div>
    </main>
</template>

<style lang="scss" scoped>
ul {
    list-style: none;
    padding: 0;
}
.col{
    padding: 0;
}

hr {
    border: 2px solid grey;
}
</style>
