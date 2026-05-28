<script setup lang="ts">
/**
 * ConfirmDialog — dialog di conferma globale e riutilizzabile.
 * Si monta una sola volta in App.vue e risponde a useConfirm().
 */
import { useConfirm } from '@/composables/useConfirm'

const { _state: state, _accept: accept, _cancel: cancel } = useConfirm()
</script>

<template>
  <v-dialog v-model="state.visible" max-width="400" persistent>
    <v-card class="confirm-card" rounded="lg">

      <!-- Icona decorativa -->
      <div class="confirm-icon-wrap" :class="state.dangerous ? 'confirm-icon-wrap--danger' : 'confirm-icon-wrap--info'">
        <v-icon :color="state.dangerous ? 'error' : 'primary'" size="26">
          {{ state.dangerous ? 'mdi-alert-circle-outline' : 'mdi-help-circle-outline' }}
        </v-icon>
      </div>

      <v-card-title v-if="state.title" class="confirm-title pt-4 px-6">
        {{ state.title }}
      </v-card-title>

      <v-card-text class="confirm-message px-6" :class="state.title ? 'pt-1' : 'pt-6'">
        {{ state.message }}
      </v-card-text>

      <v-card-actions class="confirm-actions px-6 pb-5">
        <v-spacer />
        <v-btn
          class="app-btn app-btn--text"
          variant="flat"
          size="default"
          @click="cancel"
        >
          {{ state.cancelLabel }}
        </v-btn>
        <v-btn
          class="app-btn"
          :class="state.dangerous ? 'app-btn--danger' : 'app-btn--primary'"
          variant="flat"
          size="default"
          @click="accept"
        >
          {{ state.confirmLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.confirm-card {
  overflow: visible;
}

.confirm-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  margin-top: 24px;
}

.confirm-icon-wrap--danger {
  background: #fef2f2;
}

.confirm-icon-wrap--info {
  background: #eff6ff;
}

.confirm-title {
  font-size: 15px !important;
  font-weight: 600 !important;
  color: var(--gray-900);
  text-align: center;
  white-space: normal;
  line-height: 1.4;
}

.confirm-message {
  font-size: 13px;
  color: var(--gray-600, #6b7280);
  text-align: center;
  line-height: 1.55;
  padding-bottom: 8px;
}

.confirm-actions {
  gap: 8px;
}

/* Pulsante danger — rosso per azioni distruttive */
:deep(.app-btn--danger.v-btn) {
  background: #ef4444 !important;
  color: white !important;
}
:deep(.app-btn--danger.v-btn:hover) {
  background: #dc2626 !important;
}
</style>
