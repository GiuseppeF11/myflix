<script>
export default {
  name: 'CreateAlbumModal',
  emits: ['create', 'close'],
  data() {
    return { name: '' };
  },
  mounted() {
    this.$nextTick(() => this.$refs.nameInput?.focus());
  },
  methods: {
    confirm() {
      const v = this.name.trim();
      if (v) this.$emit('create', v);
    },
  },
};
</script>

<template>
  <Teleport to="body">
    <div class="cam-overlay" @click.self="$emit('close')" role="dialog" aria-modal="true">
      <div class="cam-box">
        <h3 class="cam-title">
          Nuova cartella
        </h3>

        <input
          ref="nameInput"
          v-model="name"
          type="text"
          class="cam-input"
          placeholder="Nome cartella…"
          maxlength="60"
          @keyup.enter="confirm"
          @keyup.escape="$emit('close')"
        />

        <div class="cam-actions">
          <button class="cam-btn cam-cancel" @click="$emit('close')">Annulla</button>
          <button class="cam-btn cam-create" :disabled="!name.trim()" @click="confirm">
            <i class="fa-solid fa-plus"></i> Crea
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.cam-overlay {
  position: fixed;
  inset: 0;
  z-index: calc($z-modal + 50);
  background: $color-overlay;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-md;
}

.cam-box {
  background: #1e1e1e;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: $radius-md;
  padding: $space-xl $space-lg;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.cam-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: $color-text;
  display: flex;
  align-items: center;
  gap: $space-sm;

  i { color: $color-accent; }
}

.cam-input {
  width: 100%;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.07);
  border: 1.5px solid rgba(255, 255, 255, 0.18);
  border-radius: $radius-sm;
  color: $color-text;
  font-size: 0.95rem;
  padding: 10px 14px;
  outline: none;
  transition: border-color 0.15s;

  &::placeholder { color: $color-text-dim; }
  &:focus { border-color: rgba(255, 255, 255, 0.45); }
}

.cam-actions {
  display: flex;
  gap: $space-sm;
  justify-content: flex-end;
}

.cam-btn {
  border: none;
  border-radius: $radius-sm;
  padding: 9px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:disabled { opacity: 0.35; cursor: not-allowed; }
}

.cam-cancel {
  background: rgba(255, 255, 255, 0.08);
  color: $color-text-muted;
  &:hover:not(:disabled) { opacity: 0.75; }
}

.cam-create {
  background: $color-accent;
  color: $color-text;
  &:hover:not(:disabled) { opacity: 0.85; }
}
</style>
