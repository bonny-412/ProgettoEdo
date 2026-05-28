<script setup lang="ts">
/**
 * WelcomeDialog — appare solo al primo avvio dell'app.
 * Salva un flag in localStorage per non ripresentarsi mai più.
 */
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'edo_welcome_shown'

const visible = ref(false)

onMounted(() => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    visible.value = true
  }
})

function close() {
  localStorage.setItem(STORAGE_KEY, 'true')
  visible.value = false
}
</script>

<template>
  <v-dialog
    v-model="visible"
    max-width="360"
    persistent
    :scrim="true"
  >
    <v-card class="welcome-card" rounded="xl">
      <!-- Logo -->
      <div class="welcome-logo-wrap">
        <div class="welcome-logo-bg">
          <img src="/logo.svg" alt="Logo" class="welcome-logo-img" />
        </div>
      </div>

      <!-- Testo -->
      <v-card-text class="welcome-body">
        <div class="welcome-title">Benvenuto</div>
        <div class="welcome-subtitle">
          Il tuo strumento per creare piani alimentari personalizzati.
        </div>
      </v-card-text>

      <!-- Azione -->
      <v-card-actions class="welcome-actions">
        <v-btn
          class="welcome-btn"
          variant="flat"
          block
          @click="close"
        >
          Inizia
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.welcome-card {
  padding: 32px 24px 24px;
  text-align: center;
  overflow: visible;
}

/* ── Logo ── */
.welcome-logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.welcome-logo-bg {
  width: 96px;
  height: 96px;
  background: var(--green-800, #2e7d52);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(46, 125, 82, 0.30);
}

.welcome-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* ── Testo ── */
.welcome-body {
  padding: 0 0 24px !important;
}

.welcome-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--green-800, #2e7d52);
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.welcome-subtitle {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* ── Bottone ── */
.welcome-actions {
  padding: 0 !important;
}

:deep(.welcome-btn.v-btn) {
  background: var(--green-800, #2e7d52);
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
  height: 44px;
  border-radius: 12px;
  box-shadow: none !important;
}

:deep(.welcome-btn.v-btn:hover) {
  background: var(--green-700, #388e52);
}
</style>
