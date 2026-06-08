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
  (e: 'submitAndSave', food: Omit<Food, 'uid'>): void
}>()

interface FormState {
  nome: string
  grammi: string
  kcal: string
  proteine: string
  carboidrati: string
  grassi: string
  zuccheri: string
  fibra: string
  ferro: string
  calcio: string
  sodio: string
  acqua: string
}

const initialForm = (): FormState => ({
  nome: '',
  grammi: '100',
  kcal: '0',
  proteine: '0',
  carboidrati: '0',
  grassi: '0',
  zuccheri: '',
  fibra: '',
  ferro: '',
  calcio: '',
  sodio: '',
  acqua: ''
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

function parseOpt(v: string): number | undefined {
  const n = parseFloat(v)
  return v.trim() !== '' && !isNaN(n) ? n : undefined
}

function buildFood(): Omit<Food, 'uid'> {
  return {
    nome: form.value.nome.trim(),
    grammi: parseFloat(form.value.grammi) || 100,
    per100g: {
      kcal:        parseFloat(form.value.kcal)        || 0,
      proteine:    parseFloat(form.value.proteine)    || 0,
      carboidrati: parseFloat(form.value.carboidrati) || 0,
      grassi:      parseFloat(form.value.grassi)      || 0,
      zuccheri:    parseOpt(form.value.zuccheri),
      fibra:       parseOpt(form.value.fibra),
      ferro:       parseOpt(form.value.ferro),
      calcio:      parseOpt(form.value.calcio),
      sodio:       parseOpt(form.value.sodio),
      acqua:       parseOpt(form.value.acqua)
    },
    custom: true
  }
}

function submit(): void {
  if (!form.value.nome.trim()) return
  emit('submit', buildFood())
  close()
}

function submitAndSave(): void {
  if (!form.value.nome.trim()) return
  emit('submitAndSave', buildFood())
  close()
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="520" @update:model-value="emit('update:modelValue', $event)" persistent>
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
              type="text" inputmode="decimal" suffix="g"
              @keydown="onDecimalKeydown" @input="onDecimalInput"
            />
            <v-text-field
              v-model="form.kcal"
              label="Energia (per 100 g)"
              type="text" inputmode="decimal" suffix="kcal"
              @keydown="onDecimalKeydown" @input="onDecimalInput"
            />
            <v-text-field
              v-model="form.proteine"
              label="Proteine"
              type="text" inputmode="decimal" suffix="g"
              @keydown="onDecimalKeydown" @input="onDecimalInput"
            />
            <v-text-field
              v-model="form.carboidrati"
              label="Carboidrati"
              type="text" inputmode="decimal" suffix="g"
              @keydown="onDecimalKeydown" @input="onDecimalInput"
            />
            <v-text-field
              v-model="form.grassi"
              label="Grassi"
              type="text" inputmode="decimal" suffix="g"
              @keydown="onDecimalKeydown" @input="onDecimalInput"
            />
          </div>

          <div class="section-label">Valori facoltativi</div>
          <div class="grid-2">
            <v-text-field
              v-model="form.zuccheri"
              label="Zuccheri"
              type="text" inputmode="decimal" suffix="g" placeholder="—"
              @keydown="onDecimalKeydown" @input="onDecimalInput"
            />
            <v-text-field
              v-model="form.fibra"
              label="Fibra"
              type="text" inputmode="decimal" suffix="g" placeholder="—"
              @keydown="onDecimalKeydown" @input="onDecimalInput"
            />
            <v-text-field
              v-model="form.ferro"
              label="Ferro"
              type="text" inputmode="decimal" suffix="mg" placeholder="—"
              @keydown="onDecimalKeydown" @input="onDecimalInput"
            />
            <v-text-field
              v-model="form.calcio"
              label="Calcio"
              type="text" inputmode="decimal" suffix="mg" placeholder="—"
              @keydown="onDecimalKeydown" @input="onDecimalInput"
            />
            <v-text-field
              v-model="form.sodio"
              label="Sodio"
              type="text" inputmode="decimal" suffix="mg" placeholder="—"
              @keydown="onDecimalKeydown" @input="onDecimalInput"
            />
            <v-text-field
              v-model="form.acqua"
              label="Acqua"
              type="text" inputmode="decimal" suffix="g" placeholder="—"
              @keydown="onDecimalKeydown" @input="onDecimalInput"
            />
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn class="app-btn app-btn--text" variant="flat" @click="close">Annulla</v-btn>
        <v-btn class="app-btn app-btn--primary" variant="flat" :disabled="!form.nome.trim()" @click="submit">Aggiungi</v-btn>
        <v-btn class="app-btn app-btn--primary" variant="flat" :disabled="!form.nome.trim()" @click="submitAndSave">Aggiungi e salva</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0 12px;
  }

  .grid-2 > div {
    margin-top: 0.5rem;
  }

.section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--gray-500);
    text-transform: uppercase;
    margin: 12px 0 4px;
  }
</style>
