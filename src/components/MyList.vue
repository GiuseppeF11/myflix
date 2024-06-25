<script>
import { store } from '../store';
export default {
    name: 'MyList',
    data() {
        return {
            myMovies: store.myList
        };
    },
    methods: {
        getImageUrl(image) {
        return `https://image.tmdb.org/t/p/w1280${image}`;
        },
    },
};
</script>
<template>
    <section class="container-list px-3">
        <h2 class="">La mia lista</h2>
        <div class="row g-0 row-cols-5">
            <div class="col" v-for="movie in this.myMovies">
                <div class="card">
                    <img :src="getImageUrl(movie.poster_path)" alt="">
                </div>
            </div>
        </div>
    </section>
</template>



<style lang="scss" scoped>
    .container-list {
        padding-top: 10vh;
    }

    .card {
  box-shadow: 0px 0px 20px rgb(0, 0, 0);
  border-radius: 5px;
  position: relative; 
  overflow: hidden;
  scale: 0.9;
  transition: transform linear 0.3s;
  &:hover {
    transform: scale(1.1);
    .card-image {
      filter: brightness(20%); 
    }
    .card-details {
      display: block;
    }
  }
  .card-image {
    height: 350px;
    transition: linear 0.1s;
    cursor: pointer;
    position: relative; 
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .card-details {
    position: absolute;
    display: none;
    transition: linear 0.3s;
    color: whitesmoke;
    padding: 10px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7); 
    z-index: 10;

    h4 {
      margin-bottom: 20px
    }
    p {
      height: 200px;
      overflow: auto;
    }
  }
}


</style>
