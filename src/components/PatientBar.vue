<script setup lang="ts">
/**
 * PatientBar — barra verde chiara con dati paziente.
 * Cliccando "Modifica" si apre un piccolo dialog inline.
 */
import { ref, computed } from 'vue'
import { useWeekPlan } from '@/composables/useWeekPlan'

const plan = useWeekPlan()

const dialog = ref(false)
const dateMenu = ref(false)

// Form locale (clonato per evitare di scrivere prima di "Salva")
const form = ref({ ...plan.patient.value })

// Conversione stringa ISO → Date per il DatePicker
const pickerDate = computed<Date | null>(() => {
  if (!form.value.dataScheda) return null
  const d = new Date(form.value.dataScheda)
  return isNaN(d.getTime()) ? null : d
})

// Data formattata in italiano per la barra (es. "15/01/2024")
const dataFormattata = computed(() => {
  const d = pickerDate.value
  if (!d) return plan.patient.value.dataScheda
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
})

function onDatePicked(date: Date | null): void {
  if (!date) return
  // Vuetify restituisce un oggetto Date
  form.value.dataScheda = date instanceof Date
    ? date.toISOString().slice(0, 10)
    : String(date)
  dateMenu.value = false
}

function openDialog(): void {
  form.value = { ...plan.patient.value }
  dialog.value = true
}

function onKcalKeydown(ev: KeyboardEvent): void {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (allowed.includes(ev.key)) return
  if ((ev.ctrlKey || ev.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(ev.key.toLowerCase())) return
  const input = ev.target as HTMLInputElement
  const val = input.value
  if (ev.key === '.' && !val.includes('.')) return
  if (/^\d$/.test(ev.key)) {
    const dotIndex = val.indexOf('.')
    if (dotIndex !== -1 && val.length - dotIndex > 2) {
      ev.preventDefault()
      return
    }
    return
  }
  ev.preventDefault()
}

function onKcalInput(ev: Event): void {
  const input = ev.target as HTMLInputElement
  const cleaned = input.value.replace(/[^\d.]/g, '').replace(/^(\d*\.?\d{0,2}).*$/, '$1')
  if (input.value !== cleaned) input.value = cleaned
}

function save(): void {
  plan.updatePatient({
    nome: form.value.nome.trim() || 'Paziente',
    dataScheda: form.value.dataScheda,
    obiettivoKcal: parseFloat(String(form.value.obiettivoKcal)) || 0
  })
  dialog.value = false
}
</script>

<template>
  <div class="patient-bar">
    <div class="patient-container">
      <div class="patient-field">
        <span class="patient-label">Paziente</span>
        <span class="patient-value">{{ plan.patient.value.nome }}</span>
      </div>
      <div class="patient-sep" />
      <div class="patient-field">
        <span class="patient-label">Data scheda</span>
        <span class="patient-value">{{ dataFormattata }}</span>
      </div>
      <div class="patient-sep" />
      <div class="patient-field">
        <span class="patient-label">Obiettivo</span>
        <span class="patient-value tabular">
          {{ plan.patient.value.obiettivoKcal.toLocaleString('it-IT') }} kcal / giorno
        </span>
      </div>
    </div>

    <div class="patient-actions">
      <v-btn class="app-btn app-btn--outline" id="btn-edit" size="small" variant="flat" @click="openDialog">Modifica</v-btn>
    </div>

    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card>
        <v-card-title >
          Dati paziente
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="form.nome" label="Nome paziente" class="mb-3" variant="outlined" />
          <v-menu v-model="dateMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                :model-value="form.dataScheda
                  ? new Date(form.dataScheda).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : ''"
                label="Data scheda"
                readonly
                class="mb-3"
                variant="outlined"
                prepend-inner-icon="mdi-calendar"
              />
            </template>
            <v-date-picker
              :model-value="pickerDate"
              @update:model-value="onDatePicked"
              color="primary"
              locale="it"
            />
          </v-menu>
          <v-text-field v-model="form.obiettivoKcal" label="Obiettivo kcal / giorno"
            type="text" inputmode="decimal" suffix="kcal" variant="outlined"
            @keydown="onKcalKeydown"
            @input="onKcalInput"
          />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn class="app-btn app-btn--text" variant="flat" @click="dialog = false">Annulla</v-btn>
          <v-btn class="app-btn app-btn--primary" variant="flat" @click="save">Salva</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.patient-bar {
  background: var(--green-50);
  border-bottom: 1px solid var(--green-100);
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 20px 24px;
  flex-wrap: wrap;
}

.patient-container {
  display: flex;
  align-items: center;
  gap: 3rem;
  flex: 1;
}

.patient-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.patient-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-500);
}

.patient-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gray-900);
}

.patient-value.tabular {
  font-variant-numeric: tabular-nums;
}

.mb-3 {
  margin-bottom: 1rem !important;
}

@media (max-width: 720px) {
  .patient-bar {
    padding: 10px 14px;
    gap: 10px 14px;
  }
  .patient-container {
    justify-content: space-between;
  }
  .patient-sep {
    display: none;
  }
  .patient-actions {
    margin-left: 0;
    width: 100%;
    display: flex;
  }
  .patient-actions button {
    margin-top: 0.5rem;
    width: 100%;
  }
  .patient-field {
    align-items: center;
  }
}

.patient-sep {
  width: 1px;
  height: 20px;
  background: var(--green-100);
}

.patient-actions {
  margin-left: auto;
}
</style>
