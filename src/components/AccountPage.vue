<script>
import { useAuthStore } from '../stores/auth.js';
import { isSupabaseConfigured } from '../services/supabase.js';
import { isPasswordValid } from '../utils/password.js';
import PasswordInput from './PasswordInput.vue';
import PasswordStrength from './PasswordStrength.vue';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const MAX_ATTEMPTS = 3;

export default {
  name: 'AccountPage',
  components: { PasswordInput, PasswordStrength },
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
  data() {
    return {
      supabaseEnabled: isSupabaseConfigured,

      // Upload avatar
      uploadError: '',

      // Step: 'view' | 'verify' | 'edit'
      step: 'view',

      // Verifica password
      currentPassword: '',
      verifyError: '',
      verifyLoading: false,
      verifyAttempts: 0,

      // Form modifica
      editFirstName: '',
      editLastName: '',
      editEmail: '',
      editPassword: '',
      editPasswordConfirm: '',
      editTouched: false,
      saveError: '',
      saveSuccess: '',
      saveLoading: false,
    };
  },
  computed: {
    isLocked() {
      return this.verifyAttempts >= MAX_ATTEMPTS;
    },
    attemptsLeft() {
      return MAX_ATTEMPTS - this.verifyAttempts;
    },
    newPwValid() {
      return !this.editPassword || isPasswordValid(this.editPassword);
    },
    newPwMatch() {
      return !this.editPassword || this.editPassword === this.editPasswordConfirm;
    },
    hasChanges() {
      return (
        this.editFirstName !== this.auth.firstName ||
        this.editLastName  !== this.auth.lastName  ||
        this.editEmail     !== this.auth.email     ||
        this.editPassword  !== ''
      );
    },
    canSave() {
      return (
        this.hasChanges &&
        this.newPwValid &&
        this.newPwMatch &&
        !this.saveLoading
      );
    },
  },
  methods: {
    // ---- Avatar ----
    triggerUpload() {
      this.uploadError = '';
      this.$refs.fileInput.click();
    },
    onFile(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { this.uploadError = 'Seleziona un file immagine.'; return; }
      if (file.size > MAX_AVATAR_BYTES)    { this.uploadError = 'Immagine troppo grande (max 2 MB).'; return; }
      const reader = new FileReader();
      reader.onload = () => { this.auth.setAvatar(reader.result); this.uploadError = ''; };
      reader.readAsDataURL(file);
      e.target.value = '';
    },

    // ---- Avvia flusso modifica ----
    startEdit() {
      this.step = 'verify';
      this.currentPassword = '';
      this.verifyError = '';
      this.verifyAttempts = 0;
    },
    cancelEdit() {
      this.step = 'view';
      this.currentPassword = '';
      this.verifyError = '';
      this.saveError = '';
      this.saveSuccess = '';
    },

    // ---- Verifica password corrente ----
    async verifyPassword() {
      if (!this.currentPassword) return;
      this.verifyLoading = true;
      this.verifyError = '';
      try {
        const ok = await this.auth.verifyPassword(this.currentPassword);
        if (ok) {
          // Accesso concesso: popola il form con i dati attuali
          this.editFirstName = this.auth.firstName;
          this.editLastName  = this.auth.lastName;
          this.editEmail     = this.auth.email;
          this.editPassword  = '';
          this.editPasswordConfirm = '';
          this.editTouched   = false;
          this.step = 'edit';
        } else {
          this.verifyAttempts++;
          if (this.isLocked) {
            this.verifyError = 'Hai esaurito i tentativi. Usa il link per recuperare la password.';
          } else {
            this.verifyError = `Password errata. Tentativi rimanenti: ${this.attemptsLeft}`;
          }
        }
      } catch (err) {
        this.verifyError = err?.message || 'Errore di rete. Riprova.';
      } finally {
        this.verifyLoading = false;
      }
    },

    async sendRecovery() {
      try {
        await this.auth.resetPassword(this.auth.email);
        this.verifyError = 'Email di recupero inviata. Controlla la tua casella.';
      } catch (err) {
        this.verifyError = err?.message || 'Errore nell\'invio dell\'email.';
      }
    },

    // ---- Salva modifiche ----
    async saveProfile() {
      this.saveError = '';
      this.saveSuccess = '';
      if (!this.canSave) return;
      this.saveLoading = true;
      try {
        await this.auth.updateProfile({
          firstName:   this.editFirstName,
          lastName:    this.editLastName,
          email:       this.editEmail !== this.auth.email ? this.editEmail : undefined,
          newPassword: this.editPassword || undefined,
        });
        this.saveSuccess = 'Profilo aggiornato con successo.';
        this.editPassword = '';
        this.editPasswordConfirm = '';
        this.editTouched = false;
        setTimeout(() => { this.step = 'view'; this.saveSuccess = ''; }, 2000);
      } catch (err) {
        this.saveError = err?.message || 'Errore durante il salvataggio.';
      } finally {
        this.saveLoading = false;
      }
    },
  },
};
</script>

<template>
  <section class="account-page">
    <div class="account-container">
      <h1 class="account-title">Il mio account</h1>

      <!-- ====== AVATAR ====== -->
      <div class="avatar-section">
        <div class="avatar-wrap">
          <img v-if="auth.avatarUrl" :src="auth.avatarUrl" alt="Avatar" class="avatar-img" />
          <i v-else class="fa-solid fa-circle-user avatar-icon"></i>
        </div>
        <div class="avatar-actions">
          <div class="avatar-btns">
            <button class="btn-outline" @click="triggerUpload">
              <i class="fa-solid fa-camera"></i>
              {{ auth.avatarUrl ? 'Sostituisci immagine' : 'Carica immagine' }}
            </button>
            <button v-if="auth.avatarUrl" class="btn-outline btn-outline-danger" @click="auth.removeAvatar()">
              <i class="fa-solid fa-trash-can"></i> Rimuovi
            </button>
          </div>
          <p v-if="uploadError" class="form-error">{{ uploadError }}</p>
        </div>
      </div>
      <input ref="fileInput" type="file" accept="image/*" class="visually-hidden" @change="onFile" />

      <!-- ====== RIEPILOGO (step: view) ====== -->
      <div v-if="step === 'view'" class="info-card">
        <div class="info-row">
          <span class="info-label">Nome</span>
          <span class="info-value">{{ auth.firstName || '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Cognome</span>
          <span class="info-value">{{ auth.lastName || '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">{{ auth.email }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Password</span>
          <span class="info-value">••••••••</span>
        </div>

        <button v-if="supabaseEnabled" class="btn-primary mt-md" @click="startEdit">
          <i class="fa-solid fa-pen-to-square"></i> Modifica Account
        </button>
      </div>

      <!-- ====== VERIFICA PASSWORD (step: verify) ====== -->
      <div v-else-if="step === 'verify'" class="info-card">
        <h2 class="section-title">Conferma la tua identità</h2>
        <p class="section-desc">Inserisci la password attuale per procedere con la modifica.</p>

        <template v-if="!isLocked">
          <PasswordInput
            v-model="currentPassword"
            placeholder="Password attuale"
            autocomplete="current-password"
            @keyup.enter="verifyPassword"
          />
          <p v-if="verifyError" class="form-error">{{ verifyError }}</p>

          <button class="btn-link recovery-link" @click="sendRecovery">
            <i class="fa-solid fa-envelope"></i> Hai dimenticato la password?
          </button>

          <div class="form-actions">
            <button class="btn-ghost" @click="cancelEdit">Annulla</button>
            <button
              class="btn-primary"
              @click="verifyPassword"
              :disabled="verifyLoading || !currentPassword"
            >
              {{ verifyLoading ? 'Verifica…' : 'Conferma' }}
            </button>
          </div>
        </template>

        <template v-else>
          <p class="form-error">{{ verifyError }}</p>
          <button class="btn-link" @click="sendRecovery">
            <i class="fa-solid fa-envelope"></i> Invia email di recupero password
          </button>
          <div class="form-actions mt-md">
            <button class="btn-ghost" @click="cancelEdit">Annulla</button>
          </div>
        </template>
      </div>

      <!-- ====== FORM MODIFICA (step: edit) ====== -->
      <div v-else-if="step === 'edit'" class="info-card">
        <h2 class="section-title">Modifica Account</h2>

        <div class="form-grid">
          <div class="form-field">
            <label class="field-label">Nome</label>
            <input v-model="editFirstName" type="text" class="text-input" placeholder="Mario" autocomplete="given-name" />
          </div>
          <div class="form-field">
            <label class="field-label">Cognome</label>
            <input v-model="editLastName" type="text" class="text-input" placeholder="Rossi" autocomplete="family-name" />
          </div>
          <div class="form-field full">
            <label class="field-label">Email</label>
            <input v-model="editEmail" type="email" class="text-input" placeholder="email@esempio.it" autocomplete="email" />
          </div>
          <div class="form-field full">
            <label class="field-label">Nuova password <span class="label-optional">(lascia vuoto per non cambiare)</span></label>
            <PasswordInput
              v-model="editPassword"
              placeholder="Nuova password"
              autocomplete="new-password"
              @input="editTouched = true"
            />
            <PasswordStrength v-if="editTouched && editPassword.length > 0" :password="editPassword" />
          </div>
          <div class="form-field full" v-if="editPassword">
            <label class="field-label">Conferma nuova password</label>
            <PasswordInput
              v-model="editPasswordConfirm"
              placeholder="Conferma password"
              autocomplete="new-password"
            />
            <p v-if="editPasswordConfirm && !newPwMatch" class="form-error">Le password non coincidono.</p>
          </div>
        </div>

        <p v-if="saveError"   class="form-error">{{ saveError }}</p>
        <p v-if="saveSuccess" class="form-success">{{ saveSuccess }}</p>

        <div class="form-actions">
          <button class="btn-ghost" @click="cancelEdit">Annulla</button>
          <button class="btn-primary" @click="saveProfile" :disabled="!canSave">
            {{ saveLoading ? 'Salvataggio…' : 'Salva modifiche' }}
          </button>
        </div>
      </div>

    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.account-page {
  min-height: 100vh;
  padding: 12vh 24px 60px;
  background-color: $color-bg;
}

.account-container {
  max-width: 600px;
  margin: 0 auto;
}

.account-title {
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 800;
  margin-bottom: $space-xl;
}

// ---- Avatar ----
.avatar-section {
  display: flex;
  align-items: center;
  gap: $space-lg;
  margin-bottom: $space-xl;
}

.avatar-wrap {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background-color: $color-accent;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 3.5rem;
  color: $color-text;
  line-height: 1;
  display: block;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

// ---- Info card ----
.info-card {
  background-color: $color-surface;
  border-radius: $radius-md;
  padding: $space-lg;
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-sm 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-of-type { border-bottom: none; }
}

.info-label {
  font-size: 0.85rem;
  color: $color-text-dim;
  min-width: 90px;
}

.info-value {
  font-size: 0.95rem;
  color: $color-text;
  word-break: break-all;
  text-align: right;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.section-desc {
  font-size: 0.88rem;
  color: $color-text-muted;
  margin: 0;
}

// ---- Form ----
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-md;

  .full { grid-column: 1 / -1; }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    .full { grid-column: auto; }
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.82rem;
  color: $color-text-dim;
}

.label-optional {
  font-size: 0.75rem;
  color: $color-text-dim;
  opacity: 0.7;
}

.text-input {
  background-color: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: $radius-sm;
  color: $color-text;
  font-size: 0.95rem;
  padding: 10px 12px;
  outline: none;
  transition: border-color 0.15s ease;

  &::placeholder { color: $color-text-dim; }
  &:focus { border-color: rgba(255, 255, 255, 0.5); }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: $space-md;
  margin-top: $space-sm;
  flex-wrap: wrap;
}

.form-error   { color: #ff6b6b; font-size: 0.85rem; margin: 0; }
.form-success { color: #6bd17a; font-size: 0.85rem; margin: 0; }

// ---- Buttons ----
.btn-primary {
  background-color: $color-accent;
  color: $color-text;
  border: none;
  border-radius: $radius-sm;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: $space-sm;
  transition: opacity 0.15s ease;

  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
}

.btn-ghost {
  background: transparent;
  color: $color-text-muted;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: $radius-sm;
  padding: 10px 20px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover { border-color: rgba(255, 255, 255, 0.5); color: $color-text; }
}

.avatar-btns {
  display: flex;
  gap: $space-sm;
  flex-wrap: wrap;
}

.btn-outline {
  background: transparent;
  color: $color-text-muted;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: $radius-sm;
  padding: 8px 16px;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: $space-sm;
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover { border-color: rgba(255, 255, 255, 0.5); color: $color-text; }

  &-danger {
    color: #ff6b6b;
    border-color: rgba(255, 107, 107, 0.3);
    &:hover { border-color: #ff6b6b; color: #ff4444; }
  }
}

.btn-link {
  background: none;
  border: none;
  color: $color-accent;
  font-size: 0.88rem;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: $space-sm;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover { opacity: 0.8; }
}

.recovery-link {
  font-size: 0.80rem;
  color: $color-text-dim;
  text-decoration: none;
  margin-top: -$space-sm;

  &:hover { color: $color-accent; opacity: 1; }
}

.mt-md { margin-top: $space-md; }

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

@media (max-width: 600px) {
  .account-page { padding: 12vh 16px 40px; }
  .avatar-section { flex-direction: column; align-items: flex-start; }
}
</style>
