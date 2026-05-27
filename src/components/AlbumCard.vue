<script>
export default {
  name: 'AlbumCard',
  props: {
    album: { type: Object, required: true }, // { id, name, items[] }
  },
  emits: ['open', 'drop-items', 'delete', 'rename'],
  data() {
    return {
      menuOpen:    false,
      dragOver:    false,
      renameMode:  false,
      renameValue: '',
    };
  },
  computed: {
    itemCount() { return this.album.items?.length ?? 0; },
  },
  methods: {
    onClick() {
      if (!this.renameMode) this.$emit('open', this.album.id);
    },
    // ── Drag & Drop (drop target) ──────────────────────────────────────────
    onDragOver(e) {
      e.preventDefault();
      this.dragOver = true;
    },
    onDragLeave() { this.dragOver = false; },
    onDrop(e) {
      e.preventDefault();
      this.dragOver = false;
      try {
        const payload = JSON.parse(e.dataTransfer.getData('application/myflix-item'));
        this.$emit('drop-items', this.album.id, [payload]);
      } catch {}
    },
    // ── Menu azioni ────────────────────────────────────────────────────────
    startRename() {
      this.renameValue = this.album.name;
      this.renameMode  = true;
      this.menuOpen    = false;
      this.$nextTick(() => this.$refs.renameInput?.focus());
    },
    confirmRename() {
      const v = this.renameValue.trim();
      if (v && v !== this.album.name) this.$emit('rename', this.album.id, v);
      this.renameMode = false;
    },
    cancelRename() { this.renameMode = false; },
    deleteAlbum() {
      this.menuOpen = false;
      this.$emit('delete', this.album.id);
    },
    onMenuBlur(e) {
      if (!this.$el.contains(e.relatedTarget)) this.menuOpen = false;
    },
  },
};
</script>

<template>
  <div
    class="album-card"
    :class="{ 'album-card--dragover': dragOver }"
    @click="onClick"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Icona cartella -->
    <div class="album-folder">
      <i class="fa-solid fa-folder-open"></i>
    </div>

    <!-- Nome (normale / rename input) -->
    <div class="album-info">
      <input
        v-if="renameMode"
        ref="renameInput"
        v-model="renameValue"
        class="rename-input"
        @keyup.enter="confirmRename"
        @keyup.escape="cancelRename"
        @blur="confirmRename"
        @click.stop
      />
      <span v-else class="album-name">{{ album.name }}</span>
      <span class="album-count">{{ itemCount }} element{{ itemCount === 1 ? 'o' : 'i' }}</span>
    </div>

    <!-- Menu azioni (tre puntini) -->
    <div class="album-menu" @click.stop>
      <button class="menu-trigger" @click.stop="menuOpen = !menuOpen" aria-label="Opzioni album">
        <i class="fa-solid fa-ellipsis-vertical"></i>
      </button>
      <div v-if="menuOpen" class="menu-dropdown" @blur.capture="onMenuBlur" tabindex="-1">
        <button class="menu-item" @click="startRename">
          <i class="fa-solid fa-pencil"></i> Rinomina
        </button>
        <button class="menu-item menu-item--danger" @click="deleteAlbum">
          <i class="fa-solid fa-trash"></i> Elimina
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.album-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-sm;
  padding: $space-md $space-sm;
  background-color: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: $radius-md;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  aspect-ratio: 1 / 1.1;
  min-width: 0;

  &:hover { background-color: rgba(255, 255, 255, 0.08); border-color: rgba(255,255,255,0.25); }

  &--dragover {
    border-color: $color-accent;
    background-color: rgba(219, 25, 39, 0.1);
    transform: scale(1.03);
  }
}

.album-folder {
  font-size: 2.5rem;
  color: $color-accent;
  line-height: 1;
}

.album-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
  width: 100%;
}

.album-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: $color-text;
  text-align: center;
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.album-count {
  font-size: 0.72rem;
  color: $color-text-dim;
}

.rename-input {
  width: 100%;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: $radius-sm;
  color: $color-text;
  font-size: 0.85rem;
  text-align: center;
  padding: 3px 6px;
  outline: none;
}

// ── Menu ──────────────────────────────────────────────────────────────────
.album-menu {
  position: absolute;
  top: 6px;
  right: 6px;
}

.menu-trigger {
  background: none;
  border: none;
  color: $color-text-dim;
  font-size: 0.85rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background-color 0.15s;

  .album-card:hover & { opacity: 1; }
  &:hover { background-color: rgba(255,255,255,0.15); color: $color-text; }
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 300;
  min-width: 140px;
  background-color: rgba(20, 20, 20, 0.98);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: $radius-sm;
  box-shadow: 0 8px 24px rgba(0,0,0,0.7);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: $space-sm;
  width: 100%;
  padding: 9px 14px;
  background: none;
  border: none;
  color: $color-text-muted;
  font-size: 0.85rem;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.12s, color 0.12s;

  &:hover { background-color: rgba(255,255,255,0.07); color: $color-text; }
  &--danger { color: #ff6b78; &:hover { background-color: rgba(219,25,39,0.1); color: #ff4455; } }
}
</style>
