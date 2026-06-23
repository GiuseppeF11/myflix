<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-attribution">
        <a
          href="https://www.themoviedb.org"
          target="_blank"
          rel="noopener noreferrer"
          class="tmdb-link"
          aria-label="The Movie Database (apre in una nuova scheda)"
        >
          <img src="/img/tmdb-logo.svg" alt="TMDB — The Movie Database" class="tmdb-logo" />
        </a>
        <p class="tmdb-notice">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
      <p class="copyright">© {{ year }} Cinova</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  computed: {
    year() {
      return new Date().getFullYear();
    },
  },
};
</script>

<style scoped lang="scss">
@use '../assets/scss/partials/variables' as *;

.app-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  padding: $space-lg $space-xl;
  background-color: $color-bg;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: $space-md;
}

.footer-attribution {
  display: flex;
  align-items: center;
  gap: $space-md;
}

.tmdb-link {
  flex-shrink: 0;
  display: block;
  opacity: 0.85;
  transition: opacity 0.2s;

  &:hover { opacity: 1; }
}

.tmdb-logo {
  height: 36px;
  width: auto;
  display: block;
}

.tmdb-notice {
  font-size: 0.78rem;
  color: $color-text-dim;
  margin: 0;
  max-width: 420px;
  line-height: 1.5;
}

.copyright {
  font-size: 0.78rem;
  color: $color-text-dim;
  margin: 0;
  white-space: nowrap;
}

@media (max-width: $bp-md) {
  .app-footer {
    padding: $space-md;
    padding-bottom: calc(#{$space-md} + 64px); // spazio per la bottom-nav mobile
  }

  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: $space-sm;
  }

  .footer-attribution {
    flex-direction: column;
    align-items: flex-start;
    gap: $space-sm;
  }
}
</style>
