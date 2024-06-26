<script>
import { store } from '../store.js';

export default {
    data() {
        return {
            store,
            isScrolled: false,
        };
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        handleScroll() {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const scrollThreshold = windowHeight * 0.1;

            this.isScrolled = scrollPosition > scrollThreshold;
        },
    },
};
</script>

<template>
    <nav :class="['navbar', 'navbar-expand-lg', 'px-3', { 'scrolled': isScrolled }]">
        <div class="col-1">
            <img class="logo-netflix" src="https://image.tmdb.org/t/p/w342/wwemzKWzjKYJFfCeiB57q3r4Bcm.png" alt="logo-netflix">
        </div>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse justify-content-between px-2" id="navbarSupportedContent">
            <div>
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item" >
                        <router-link to="/" :class="{ 'active': $route.path === '/' }" class="btn">Home<span class="sr-only">(current)</span></router-link>
                    </li>
                    <li class="nav-item" >
                        <router-link to="/film" :class="{ 'active': $route.path === '/film' }" class="btn">Film</router-link>
                    </li>
                    <li class="nav-item" >
                        <router-link to="/series" :class="{ 'active': $route.path === '/series' }" class="btn">Serie Tv</router-link>
                    </li>
                    <li class="nav-item" >
                        <router-link to="/my-list" :class="{ 'active': $route.path === '/my-list' }" class="btn">La mia lista</router-link>
                    </li>
                </ul>
            </div>
            <form class="form-inline my-2 my-lg-0 d-flex" v-if="$route.path === '/'">
                <input class="form-control mr-sm-2" type="search" placeholder="Cerca" aria-label="Search" v-model="store.searchText">
            </form>
        </div>
    </nav>
</template>


<style lang="scss" scoped>
.logo-netflix {
    width: 100%;
    min-width: 100px;
}

.form-control:focus {
    border: 2 solid rgb(0, 0, 0);
    box-shadow: 0px 0px 10px rgb(204, 204, 204);
}

li.nav-item {
    a {
        color: rgb(220, 220, 220);
        margin: 10px;
        border-radius: 10px;
        &:hover {
            box-shadow: 0px 1px 10px white;
            transition: 0.5s;
        }
        &.active {
            color: white;
        }
    }    
}


.navbar {
    transition: background-color 0.3s linear;
    background-color: rgba(0, 0, 0, 0);
}

.navbar.scrolled {
    background-color: #1C1C1C;
    transition: background-color 0.3s linear;
}


</style>
