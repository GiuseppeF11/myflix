<script>
export default {
  name: 'TrailerModal',
  props: {
    show: { type: Boolean, default: false },
    url: { type: String, default: '' },
  },
  emits: ['close'],
};
</script>

<template>
  <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')" aria-label="Chiudi">&times;</button>
      <iframe
        width="100%"
        height="100%"
        :src="url"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
        allowfullscreen
        webkit-allowfullscreen
      ></iframe>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5vh 16px;
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 900px;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 14px;
  z-index: 1;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background-color 0.15s ease;
}

.close-button:hover {
  background-color: #000;
}

/* ── Mobile: modal a schermo intero ───────────────────────────────────────── */
@media (max-width: 767px) {
  .modal-overlay {
    padding: 0;
    background-color: #000;
    align-items: stretch;
  }

  .modal-content {
    max-width: 100%;
    height: 100%;
    aspect-ratio: unset;
    border-radius: 0;
  }
}
</style>
