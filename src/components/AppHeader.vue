<script>
import { store } from '../store.js';

export default {
    data() {
        return {
            store,
            isScrolled: false,
            isTogglerClicked: false,
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
        handleTogglerClick() { // Aggiungi questa funzione
            this.isTogglerClicked = !this.isTogglerClicked;
        },
    },
};
</script>


<template>
    <nav :class="['navbar', 'navbar-expand-lg', 'px-3', { 'scrolled': isScrolled }]">
        <div class="col-1">
            <img class="logo-netflix" src="/public/img/logo-myflix.png" alt="logo-netflix">
        </div>
        <button 
            class="navbar-toggler border custom-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarSupportedContent" 
            aria-controls="navbarSupportedContent" 
            aria-expanded="false" 
            aria-label="Toggle navigation" 
            @click="handleTogglerClick" 
            :class="{ 'active': isTogglerClicked }">
            <span class="fa-solid fa-bars"></span>
        </button>

        <div class="collapse navbar-collapse justify-content-between px-2 compact-menu" id="navbarSupportedContent">
            <div>
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item">
                        <router-link to="/" :class="{ 'active': $route.path === '/' }" class="btn">Home<span class="sr-only"></span></router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/film" :class="{ 'active': $route.path === '/film' }" class="btn">Film</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/series" :class="{ 'active': $route.path === '/series' }" class="btn">Serie Tv</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/my-list" :class="{ 'active': $route.path === '/my-list' }" class="btn">Preferiti</router-link>
                    </li>
                </ul>
            </div>
            <form class="form-inline my-2 my-lg-0" v-if="$route.path === '/'">
                <input class="form-control mr-sm-2" type="search" placeholder="Cerca" aria-label="Search" v-model="store.searchText">
            </form>
        </div>
    </nav>
</template>


<style lang="scss" scoped>
.logo-netflix {
    width: 100%;
    min-width: 100px;
    margin-right: 30px;
}

.form-control:focus {
    border: 2px solid rgb(0, 0, 0);
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
    width: 100%;
}

.navbar.scrolled {
    background-color: #1C1C1C;
    transition: background-color 0.3s linear;
}


.navbar-toggler {
    span {
        color: #FFFFFF;
    }
}

.navbar-toggler.active {
    box-shadow: 0px 0px 10px white !important; 
}

.navbar-toggler:focus {
    box-shadow: none;
}

.navbar-collapse {
    border-radius: 10px;
}

@media (max-width: 992px) {
    .navbar-collapse {
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);        
        align-items: start;
        display: flex;
    }
}
</style>
