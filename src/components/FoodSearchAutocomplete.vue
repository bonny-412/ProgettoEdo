<script setup lang="ts">
/**
 * FoodSearchAutocomplete — campo di ricerca con autocompletamento.
 * - Carica l'indice JSON al primo focus (lazy).
 * - All'invio o alla selezione, emette `add` con il `Food` pronto
 *   per essere aggiunto al pasto.
 * - Espone anche `custom` per aprire il dialog di alimento manuale.
 */
import { ref } from 'vue'
import type { FoodIndexEntry, Food } from '@/types'
import { useFoodSearch } from '@/composables/useFoodSearch'
import { loadFoodDetail } from '@/services/foodService'
import { extractPer100g, capitalize } from '@/utils/nutrition'

const emit = defineEmits<{
  (e: 'add', food: Omit<Food, 'uid'>): void
  (e: 'custom'): void
}>()

const { results, loading, error, search, ensureIndex } = useFoodSearch()

const query = ref('')
const selected = ref<FoodIndexEntry | null>(null)
const grammi = ref<string>('100')
const submitting = ref(false)

async function onFocus(): Promise<void> {
  await ensureIndex()
}

function onGramsKeydown(ev: KeyboardEvent): void {
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

function onGramsInput(ev: Event): void {
  const input = ev.target as HTMLInputElement
  const cleaned = input.value.replace(/[^\d.]/g, '').replace(/^(\d*\.?\d{0,2}).*$/, '$1')
  if (input.value !== cleaned) input.value = cleaned
}

async function onSearch(value: unknown): Promise<void> {
  query.value = typeof value === 'string' ? value : ''
  await search(query.value)
}

async function onAdd(): Promise<void> {
  if (!selected.value) return
  submitting.value = true
  try {
    const detail = await loadFoodDetail(selected.value)
    const per100 = extractPer100g(detail)
    emit('add', {
      sourceId: selected.value.id,
      nome: capitalize(selected.value.nome),
      grammi: parseFloat(grammi.value) || 100,
      per100g: per100,
      custom: false
    })
    selected.value = null
    query.value = ''
    grammi.value = '100'
  } catch (err) {
    console.error(err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="meal-search-row">
    <v-autocomplete
      v-model="selected"
      :items="results"
      :loading="loading"
      :item-title="(it: FoodIndexEntry) => capitalize(it.nome)"
      :item-value="(it: FoodIndexEntry) => it"
      return-object
      no-filter
      hide-no-data
      density="compact"
      variant="outlined"
      placeholder="Cerca alimento (es. tonno, tofu, tacchino…)"
      class="search-input"
      @focus="onFocus"
      @update:search="onSearch"
    >
      <template #item="{ item, props }">
        <v-list-item v-bind="props" :title="capitalize(item.raw.nome)" :subtitle="item.raw.categoria" />
      </template>
      <template v-if="error" #append-inner>
        <span class="search-error" :title="error">⚠</span>
      </template>
    </v-autocomplete>

    <v-text-field
      v-model="grammi"
      type="text"
      inputmode="decimal"
      suffix="g"
      density="compact"
      variant="outlined"
      class="qty-input"
      hide-details
      @keydown="onGramsKeydown"
      @input="onGramsInput"
    />

    <v-btn
      class="app-btn app-btn--green-sm"
      size="small"
      variant="flat"
      :disabled="!selected || submitting"
      @click="onAdd"
    >Aggiungi</v-btn>

    <v-btn class="app-btn app-btn--link" size="small" variant="flat" @click="emit('custom')">o manuale</v-btn>
  </div>
</template>

<style scoped>
.meal-search-row {
  padding: 8px 14px;
  border-top: 1px dashed #e0e0dc;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
}

.search-input { flex: 1 1 auto; min-width: 0; }
.qty-input {  flex: 0 0 150px; }

.search-error {
  color: var(--red);
  font-size: 14px;
}

/* Mobile: i campi vanno a capo invece di stringersi. */
@media (max-width: 600px) {
  .meal-search-row {
    flex-wrap: wrap;
    padding: 8px 10px;
  }
  /* Riga 1: ricerca */
  .search-input  { flex: 1 1 100%; }
  /* Riga 2: grammi da solo */
  .qty-input     { flex: 1 1 100%; width: 100%; }
  /* Riga 3: i due bottoni affiancati */
  .app-btn--green-sm { flex: 1 1 auto; }
  .app-btn--link     { flex: 1 1 auto; margin-left: 0; }
}
</style>
