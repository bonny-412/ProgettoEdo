<script setup lang="ts">
/**
 * AppHeader — topbar verde con brand e pulsanti.
 */
import { ref } from 'vue'
import { useWeekPlan } from '@/composables/useWeekPlan'
import { useSidebar } from '@/composables/useSidebar'
import { useConfirm } from '@/composables/useConfirm'
import { usePrintPdf } from '@/composables/usePrintPdf'
import CustomFoodLibraryDialog from './CustomFoodLibraryDialog.vue'

const libraryDialog = ref(false)
const plan = useWeekPlan()
const { isSidebarOpen, toggleSidebar } = useSidebar()
const { confirm } = useConfirm()
const { printPdf } = usePrintPdf()

async function handleReset(): Promise<void> {
  const ok = await confirm({
    title: 'Nuova scheda',
    message: 'Vuoi creare una nuova scheda? I dati correnti andranno persi.',
    confirmLabel: 'Crea nuova',
    cancelLabel: 'Annulla',
    dangerous: true
  })
  if (ok) plan.resetAll()
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <!-- Hamburger: visibile solo su mobile/tablet (≤ 900px) -->
      <v-btn
        class="btn-menu"
        :icon="isSidebarOpen ? 'mdi-close' : 'mdi-menu'"
        variant="text"
        color="white"
        density="comfortable"
        :aria-label="isSidebarOpen ? 'Chiudi settimana' : 'Apri settimana'"
        @click="toggleSidebar"
      />

      <div class="topbar-identity">
        <div class="topbar-logo" aria-hidden="true">
          <img src="/logo.svg" alt="Logo" class="topbar-logo-img" />
        </div>
        <div class="topbar-brand">
          <div class="brand-name">Edoardo</div>
          <div class="brand-role">DIETISTA</div>
        </div>
      </div>
    </div>

    <div class="topbar-actions">
      <!-- Desktop: bottoni con testo -->
      <v-btn class="topbar-btn topbar-btn--ghost btn-desktop" variant="flat" prepend-icon="mdi-star-outline" @click="libraryDialog = true">Libreria</v-btn>
      <v-btn class="topbar-btn topbar-btn--ghost btn-desktop" variant="flat" prepend-icon="mdi-plus" @click="handleReset">Nuova scheda</v-btn>
      <v-btn class="topbar-btn topbar-btn--white btn-desktop" variant="flat" prepend-icon="mdi-printer" @click="printPdf">Stampa PDF</v-btn>

      <!-- Mobile: menu a comparsa -->
      <v-menu class="btn-mobile">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            class="topbar-btn topbar-btn--ghost btn-mobile"
            icon="mdi-dots-vertical"
            variant="flat"
            density="comfortable"
          />
        </template>
        <v-list density="compact">
          <v-list-item prepend-icon="mdi-star-outline" title="Libreria" @click="libraryDialog = true" />
          <v-list-item prepend-icon="mdi-plus" title="Nuova scheda" @click="handleReset" />
          <v-list-item prepend-icon="mdi-printer" title="Stampa PDF" @click="printPdf" />
        </v-list>
      </v-menu>
    </div>
  </header>

  <CustomFoodLibraryDialog v-model="libraryDialog" />
</template>

<style scoped>
.topbar {
  background: var(--green-800);
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-identity {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Hamburger — nascosto su desktop, visibile su mobile/tablet */
.btn-menu { display: none; }

/* Mobile menu: nascosto su desktop */
.btn-mobile { display: none; }

@media (max-width: 900px) {
  .topbar { position: relative; }

  .topbar-identity {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .btn-menu   { display: inline-flex; }
  .btn-desktop { display: none; }
  .btn-mobile  { display: inline-flex; }
}

.topbar-logo {
  width: 46px;
  height: 46px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
}

.topbar-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-name {
  color: white;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
}

.brand-role {
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  letter-spacing: 0.12em;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}


@media (max-width: 720px) {
  .topbar { padding: 0 14px; }
  .brand-role { display: none; }
}

/* ── Override Vuetify v-btn: aspetto originale ─────────────── */
:deep(.topbar-btn.v-btn) {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
  border-radius: var(--radius-sm);
  height: 32px;
  min-width: 0;
  padding: 0 14px;
  box-shadow: none !important;
  transition: background 0.15s ease, transform 0.05s ease;
}
:deep(.topbar-btn.v-btn:active) {
  transform: translateY(1px);
}
/* Disabilita l'overlay interno di Vuetify: gestiamo noi l'hover */
:deep(.topbar-btn.v-btn > .v-btn__overlay) {
  display: none;
}
:deep(.topbar-btn.v-btn .v-icon) {
  font-size: 15px;
}

/* Ghost (trasparente su verde) */
:deep(.topbar-btn--ghost.v-btn) {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}
:deep(.topbar-btn--ghost.v-btn:hover) {
  background: rgba(255, 255, 255, 0.22);
}

/* White */
:deep(.topbar-btn--white.v-btn) {
  background: white;
  color: var(--green-800);
}
:deep(.topbar-btn--white.v-btn:hover) {
  background: var(--green-50);
}
</style>
