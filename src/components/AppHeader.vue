<script>
import {store} from '../store.js'

export default {
    data() {
        return {
            store,
    
        };
    },
    components: {
        
    },  
    methods: {
        
    },

}
</script>

<template>
    <header>
        <input v-model="store.searchText" type="text" placeholder="Inserisci il nome" >
        <button type="button" @click="$emit('performSearch')" >Cerca</button>
    </header>
</template>

<style lang="scss" scoped>
.movie-list {
    min-height: 50vh;
    background-color: rgba(108, 21, 21, 0.67);
}
</style>
