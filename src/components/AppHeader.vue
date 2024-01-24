<script>
import {store} from '../store'
import SingleMovie from './SingleMovie.vue'
export default {
    data() {
        return {
            store
        };
    },
    components: {
        SingleMovie,
    },  
    methods: {

    },

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

                <SingleMovie/>
            </form>
        </div>
    </header>
</template>

<style lang="scss" scoped>
</style>
