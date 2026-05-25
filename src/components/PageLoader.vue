<template>
  <transition name="loader-fade">
    <div v-if="visible" class="loader-overlay" aria-hidden="true">
      <span class="loader"></span>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PageLoader',
  props: {
    visible: { type: Boolean, default: false },
  },
};
</script>

<style scoped>
/* ---- Overlay ---- */
.loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(28, 28, 28, 0.75);
  backdrop-filter: blur(3px);
}

/* ---- Loader (CSS fornito dall'utente, invariato) ---- */
.loader {
  display: block;
  width: 84px;
  height: 84px;
  position: relative;
}

.loader:before,
.loader:after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #db1927;
  transform: translate(-50%, -100%) scale(0);
  animation: push_401 2s infinite linear;
}

.loader:after {
  animation-delay: 1s;
}

@keyframes push_401 {
  0%,
  50% {
    transform: translate(-50%, 0%) scale(1);
  }
  100% {
    transform: translate(-50%, -100%) scale(0);
  }
}

/* ---- Transizione fade dell'overlay ---- */
.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.2s ease;
}
.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}
</style>
