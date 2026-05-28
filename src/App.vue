<script setup lang="ts">
/**
 * App.vue — shell principale.
 * Layout full-viewport: occupa l'intera pagina su qualsiasi schermo.
 * Tre fasce verticali: topbar / patient bar / layout (sidebar + content).
 */
import AppHeader from './components/AppHeader.vue'
import PatientBar from './components/PatientBar.vue'
import WeeklySidebar from './components/WeeklySidebar.vue'
import DayView from './components/DayView.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import WelcomeDialog from './components/WelcomeDialog.vue'
</script>

<template>
  <v-app>
    <div class="app-shell">
      <AppHeader />
      <PatientBar />

      <div class="layout">
        <WeeklySidebar />
        <DayView />
      </div>
    </div>

    <ConfirmDialog />
    <WelcomeDialog />
  </v-app>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100dvh;       /* dynamic viewport (mobile safari) */
  width: 100%;
  background: white;
}

.layout {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;        /* indispensabile per consentire lo scroll interno */
  background: white;
}

/* Tablet/mobile: la sidebar è un drawer fisso fuori dal flusso,
   il content occupa tutta la larghezza. */
@media (max-width: 900px) {
  .layout {
    flex-direction: row;
  }
}

</style>
