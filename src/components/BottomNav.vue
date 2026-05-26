<script>
export default {
  name: 'BottomNav',
  data() {
    return {
      navItems: [
        { to: '/film',    label: 'Film',     icon: 'fa-film' },
        { to: '/series',  label: 'Serie',    icon: 'fa-tv' },
        { to: '/',        label: 'Home',     icon: 'fa-house' },
        { to: '/search',  label: 'Cerca',    icon: 'fa-magnifying-glass' },
        { to: '/my-list', label: 'Preferiti', icon: 'fa-bookmark' },
      ],
    };
  },
};
</script>

<template>
  <nav class="bottom-nav" aria-label="Navigazione principale">
    <router-link
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="bottom-nav-item"
      :class="{ active: $route.path === item.to }"
    >
      <i :class="['fa-solid', item.icon]"></i>
      <span>{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: $z-header;
  display: none;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  background-color: rgba(0, 0, 0, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  padding: 6px 0;
  color: $color-text-dim;
  font-size: 0.7rem;
  text-decoration: none;
  transition: color 0.15s ease;
  background: none;
  border: none;
  cursor: pointer;

  i {
    font-size: 1.15rem;
  }

  &.active,
  &:hover {
    color: $color-text;
  }

  // Icona cerca: evidenziata in accent quando attiva
  &[href='/search'].active {
    color: $color-accent;
  }
}

// Visibile solo sotto il breakpoint desktop
@media (max-width: $bp-lg) {
  .bottom-nav {
    display: flex;
  }
}
</style>
