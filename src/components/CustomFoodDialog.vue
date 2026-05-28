<script setup lang="ts">
/**
 * CustomFoodDialog — dialog per inserire un alimento manuale.
 * I valori nutrizionali si intendono sempre per 100 g.
 */
import { ref, watch } from 'vue'
import type { Food } from '@/types'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', food: Omit<Food, 'uid'>): void
}>()

interface FormState {
  nome: string
  grammi: string
  kcal: string
  proteine: string
  carboidrati: string
  grassi: string
}

const initialForm = (): FormState => ({
  nome: '',
  grammi: '100',
  kcal: '0',
  proteine: '0',
  carboidrati: '0',
  grassi: '0'
})

const form = ref<FormState>(initialForm())
const valid = ref(false)

// Resetta il form ogni volta che il dialog si apre
watch(
  () => props.modelValue,
  (open) => {
    if (open) form.value = initialForm()
  }
)

// Solo cifre intere (per grammi)
function onIntKeydown(ev: KeyboardEvent): void {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (allowed.includes(ev.key)) return
  if ((ev.ctrlKey || ev.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(ev.key.toLowerCase())) return
  if (/^\d$/.test(ev.key)) return
  ev.preventDefault()
}

// Cifre + massimo un punto decimale con max 2 decimali
function onDecimalKeydown(ev: KeyboardEvent): void {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (allowed.includes(ev.key)) return
  if ((ev.ctrlKey || ev.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(ev.key.toLowerCase())) return
  const input = ev.target as HTMLInputElement
  const val = input.value
  if (ev.key === '.' && !val.includes('.')) return
  if (/^\d$/.test(ev.key)) {
    // Blocca se siamo già a 2 decimali
    const dotIndex = val.indexOf('.')
    if (dotIndex !== -1 && val.length - dotIndex > 2) {
      ev.preventDefault()
      return
    }
    return
  }
  ev.preventDefault()
}

function onDecimalInput(ev: Event): void {
  const input = ev.target as HTMLInputElement
  // Sanitizza in caso di incolla: solo cifre, un punto, max 2 decimali
  const cleaned = input.value.replace(/[^\d.]/g, '').replace(/^(\d*\.?\d{0,2}).*$/, '$1')
  if (input.value !== cleaned) input.value = cleaned
}

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  if (!form.value.nome.trim()) return
  emit('submit', {
    nome: form.value.nome.trim(),
    grammi: parseFloat(form.value.grammi) || 100,
    per100g: {
      kcal: parseFloat(form.value.kcal) || 0,
      proteine: parseFloat(form.value.proteine) || 0,
      carboidrati: parseFloat(form.value.carboidrati) || 0,
      grassi: parseFloat(form.value.grassi) || 0
    },
    custom: true
  })
  close()
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="500" @update:model-value="emit('update:modelValue', $event)" persistent>
    <v-card>
      <v-card-title>Aggiungi alimento manuale</v-card-title>
      <v-card-subtitle>I valori nutrizionali si riferiscono sempre a <b>100g</b>.</v-card-subtitle>

      <v-card-text>
        <v-form v-model="valid" @submit.prevent="submit">
          <v-text-field
            v-model="form.nome"
            label="Nome alimento"
            :rules="[(v: string) => !!v?.trim() || 'Obbligatorio']"
            class="mb-3"
            autofocus
          />
          <div class="grid-2">
            <v-text-field
              v-model="form.grammi"
              label="Quantità servita"
              type="text"
              inputmode="decimal"
              suffix="g"
              @keydown="onDecimalKeydown"
              @input="onDecimalInput"
            />
            <v-text-field
              v-model="form.kcal"
              label="Energia (per 100 g)"
              type="text"
              inputmode="decimal"
              suffix="kcal"
              @keydown="onDecimalKeydown"
              @input="onDecimalInput"
            />
            <v-text-field
              v-model="form.proteine"
              label="Proteine (per 100 g)"
              type="text"
              inputmode="decimal"
              suffix="g"
              @keydown="onDecimalKeydown"
              @input="onDecimalInput"
            />
            <v-text-field
              v-model="form.carboidrati"
              label="Carboidrati (per 100 g)"
              type="text"
              inputmode="decimal"
              suffix="g"
              @keydown="onDecimalKeydown"
              @input="onDecimalInput"
            />
            <v-text-field
              v-model="form.grassi"
              label="Grassi (per 100 g)"
              type="text"
              inputmode="decimal"
              suffix="g"
              @keydown="onDecimalKeydown"
              @input="onDecimalInput"
            />
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn class="app-btn app-btn--text" variant="flat" @click="close">Annulla</v-btn>
        <v-btn class="app-btn app-btn--primary" variant="flat" :disabled="!form.nome.trim()" @click="submit">Aggiungi</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
</style>
