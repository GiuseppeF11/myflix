<script>
import {store} from '../store'
export default {
    data() {
        return {
            store
        };
    },
    methods: {

    },
    props: {
        movie: Object
    }
}
</script>

<template>
    <div class="col card">
        <div class="img-box">
            <img :src="card.card_images[0].image_url" :alt="card.name">
        </div>
        <div class="p-2 text-box">
            <h5 class="name-monster text-center text-light">{{card.name}}</h5>
            <h6 class="type-monster text-center">{{card.archetype}}</h6>
        </div>
    </div>
</template>

<style lang="scss" scoped>
</style>
