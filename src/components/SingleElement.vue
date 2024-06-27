<script>
export default {
    data() {
        return {
            showModal: false,
        };
    },
    methods: {
        toggleModal() {
            this.showModal = !this.showModal;
        },
        getEmbedUrl() {
            // This method converts the trailer URL to the embed format if it's a YouTube link
            if (!this.trailerUrl) return '';

            let url = new URL(this.trailerUrl);
            if (url.hostname.includes('youtube.com') && url.searchParams.get('v')) {
                return `https://www.youtube.com/embed/${url.searchParams.get('v')}`;
            } else if (url.hostname.includes('youtu.be')) {
                return `https://www.youtube.com/embed${url.pathname}`;
            }

            return this.trailerUrl; // Return the original URL if it's not a YouTube link
        }
    },
    props: {
        titleOrName: String,
        originalTitleorName: String,
        originalLanguage: String,
        voteAverage: Number,
        poster: String,
        overview: String,
        trailerUrl: String, // Add this prop for the trailer URL
    }
}
</script>

<template>
    <section class="card">
        <div class="card-image">
            <img :src="poster" :alt="titleOrName" class="poster" v-if="poster != null">
            <img src="https://image.pngaaa.com/321/3555321-small.png" :alt="titleOrName" class="poster" v-else>
        </div>
        <div class="card-details">
            <div>
                <h4>{{ titleOrName }}</h4>
                <p>{{ overview }}</p>                    
            </div>
            <div>
                <button class="btn btn-outline-light" @click="toggleModal">
                    <i class="fa-solid fa-play"></i>
                </button>
            </div>
        </div>
    </section>
    
    <!-- Modal for trailer player -->
    <div v-if="showModal" class="modal-overlay" @click="toggleModal">
        <div class="modal-content" @click.stop>
            <span class="close-button" @click="toggleModal">&times;</span>
            <iframe :src="getEmbedUrl()" width="100%" height="500" frameborder="0" allowfullscreen></iframe>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>
