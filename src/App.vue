<script>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import AppHeader from './components/AppHeader.vue';
import BottomNav from './components/BottomNav.vue';
import ScrollToTop from './components/ScrollToTop.vue';
import ResetPasswordModal from './components/ResetPasswordModal.vue';
import PageLoader from './components/PageLoader.vue';
import { useSearchStore } from './stores/search.js';
import { useAuthStore } from './stores/auth.js';

export default {
    setup() {
        const search = useSearchStore();
        const auth   = useAuthStore();
        const router = useRouter();
        const isRouteLoading = ref(false);
        let loadTimer = null;

        router.beforeEach(() => {
            // Piccolo ritardo per non mostrare il loader su transizioni istantanee
            loadTimer = setTimeout(() => { isRouteLoading.value = true; }, 80);
        });
        router.afterEach(() => {
            clearTimeout(loadTimer);
            isRouteLoading.value = false;
        });

        return { search, auth, isRouteLoading };
    },
    components: {
        AppHeader,
        BottomNav,
        ScrollToTop,
        ResetPasswordModal,
        PageLoader,
    },
    watch: {
        'search.text'(val) {
            // Sulle rotte bare (es. /reset-password) la ricerca non è disponibile.
            if (this.$route.meta.bare) return;
            // Se si cerca mentre non si è in home, vai in home dove i risultati sono visibili.
            if (val && this.$route.path !== '/') {
                this.$router.push('/');
            }
            this.search.run();
        },
    },
};
</script>

<template>
    <div id="app-root">
        <!-- Loader di navigazione -->
        <PageLoader :visible="isRouteLoading" />

        <!-- Header e nav nascosti sulle rotte "bare" (es. /reset-password) -->
        <template v-if="!$route.meta.bare">
            <header>
                <AppHeader />
            </header>
        </template>

        <main :class="{ 'bare-main': $route.meta.bare }">
            <router-view></router-view>
        </main>

        <template v-if="!$route.meta.bare">
            <ScrollToTop />
            <BottomNav />
        </template>

        <!--
          Safety-net: se isRecovering scatta su una rotta non-bare
          (es. token ricevuto in una tab già aperta), mostra il modale di overlay.
        -->
        <ResetPasswordModal v-if="auth.isRecovering && !$route.meta.bare" />
    </div>
</template>

<style lang="scss">
@use "assets/scss/main" as *;
@import "assets/scss/partials/reset";

body {
    background-color: #1C1C1C ;
    color: white;
}

// Spazio per la bottom-nav su mobile, così non copre il contenuto.
// Le rotte bare (es. /reset-password) non hanno la bottom-nav.
@media (max-width: 992px) {
    main:not(.bare-main) {
        padding-bottom: 64px;
    }
}

</style>
