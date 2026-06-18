<script>
import BrowseGrid from './BrowseGrid.vue';

export default {
    name: 'Film',
    components: { BrowseGrid },
};
</script>

<template>
    <BrowseGrid media-type="movie" title="Film" />
</template>
