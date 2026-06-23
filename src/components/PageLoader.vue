<template>
  <transition name="loader-fade">
    <div v-if="visible" class="loader-overlay" aria-hidden="true">
      <div class="loader">
        <div class="ring"></div>
        <div class="ring ring--delay"></div>
        <div class="play-btn">
          <div class="play-triangle"></div>
        </div>
      </div>
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
  background-color: rgba(28, 28, 28, 0.85);
  backdrop-filter: blur(4px);
}

/* ---- Wrapper ---- */
.loader {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
}

/* ---- Anelli pulsanti ---- */
.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(245, 158, 11, 0.75);
  animation: pulse-ring 2s ease-out infinite;
}

.ring--delay {
  animation-delay: 1s;
}

@keyframes pulse-ring {
  0%   { width: 58px;  height: 58px;  opacity: 1; }
  100% { width: 140px; height: 140px; opacity: 0; }
}

/* ---- Bottone play centrale ---- */
.play-btn {
  position: relative;
  z-index: 1;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #f59e0b;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 0 0 rgba(245, 158, 11, 0.5),
    0 4px 24px rgba(245, 158, 11, 0.4);
  animation: pulse-btn 2s ease-in-out infinite;
}

@keyframes pulse-btn {
  0%, 100% { transform: scale(1);    box-shadow: 0 0 0  0px rgba(245, 158, 11, 0.4), 0 4px 24px rgba(245, 158, 11, 0.4); }
  50%       { transform: scale(0.94); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0),   0 4px 24px rgba(245, 158, 11, 0.2); }
}

/* ---- Triangolo play (CSS puro) ---- */
.play-triangle {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11px 0 11px 20px;
  border-color: transparent transparent transparent #ffffff;
  margin-left: 5px; /* centramento ottico */
}

/* ---- Transizione fade ---- */
.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.25s ease;
}
.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}
</style>
