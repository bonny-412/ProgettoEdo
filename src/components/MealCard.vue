<script setup lang="ts">
/**
 * MealCard — singolo pasto.
 * - Header con nome / kcal totali / menu opzioni
 * - Tabella alimenti (FoodTable)
 * - Riga di ricerca + alimento manuale
 * - Nota libera in fondo
 * - Menu contestuale per modificare il pasto o eliminarlo
 */
import { computed, ref } from 'vue'
import type { DayKey, Meal, MealType, Food } from '@/types'
import { useWeekPlan } from '@/composables/useWeekPlan'
import { useCustomFoodLibrary } from '@/composables/useCustomFoodLibrary'
import { MEAL_TYPE_COLOR, MEAL_TYPE_OPTIONS } from '@/data/defaults'
import { formatKcal } from '@/utils/nutrition'
import { useConfirm } from '@/composables/useConfirm'

import FoodTable from './FoodTable.vue'
import FoodSearchAutocomplete from './FoodSearchAutocomplete.vue'
import CustomFoodDialog from './CustomFoodDialog.vue'

const props = defineProps<{
  dayKey: DayKey
  meal: Meal
}>()

const plan = useWeekPlan()
const { confirm } = useConfirm()
const { save: saveCustomFood } = useCustomFoodLibrary()

const totals = computed(() => plan.totalsForMeal(props.meal))
const dotColor = computed(() => MEAL_TYPE_COLOR[props.meal.tipo])

// — Dialog "modifica pasto"
const editDialog = ref(false)
const editForm = ref({
  nome: props.meal.nome,
  tipo: props.meal.tipo as MealType
})

function openEdit(): void {
  editForm.value = {
    nome: props.meal.nome,
    tipo: props.meal.tipo
  }
  editDialog.value = true
}

function saveEdit(): void {
  plan.updateMeal(props.dayKey, props.meal.uid, {
    nome: editForm.value.nome.trim() || 'Pasto',
    tipo: editForm.value.tipo
  })
  editDialog.value = false
}

async function removeMeal(): Promise<void> {
  const ok = await confirm({
    title: 'Elimina pasto',
    message: `Vuoi eliminare il pasto "${props.meal.nome}"? L'operazione non può essere annullata.`,
    confirmLabel: 'Elimina',
    dangerous: true
  })
  if (ok) plan.removeMeal(props.dayKey, props.meal.uid)
}

// — Alimenti
const customDialog = ref(false)

function onAddFood(food: Omit<Food, 'uid'>): void {
  plan.addFood(props.dayKey, props.meal.uid, food)
}

function onAddAndSaveFood(food: Omit<Food, 'uid'>): void {
  saveCustomFood(food.nome, food.per100g)
  plan.addFood(props.dayKey, props.meal.uid, food)
}

async function onRemoveFood(foodUid: string): Promise<void> {
  const ok = await confirm({
    title: 'Rimuovi alimento',
    message: 'Vuoi rimuovere questo alimento dal pasto?',
    confirmLabel: 'Rimuovi',
    dangerous: true
  })
  if (ok) plan.removeFood(props.dayKey, props.meal.uid, foodUid)
}

function onUpdateGrams(foodUid: string, grams: number): void {
  plan.updateFood(props.dayKey, props.meal.uid, foodUid, { grammi: grams })
}

// — Nota
function onNoteInput(ev: Event): void {
  const target = ev.target as HTMLTextAreaElement
  plan.updateMeal(props.dayKey, props.meal.uid, { nota: target.value })
}
</script>

<template>
  <article class="meal-card">
    <header class="meal-header">
      <div class="meal-header-left">
        <span class="meal-dot" :style="{ background: dotColor }" />
        <span class="meal-name">{{ meal.nome }}</span>
      </div>
      <div class="meal-header-right">
        <span class="meal-kcal tabular">
          <strong>{{ formatKcal(totals.kcal) }}</strong> kcal
        </span>

        <v-menu location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn class="app-btn app-btn--icon-sm" icon="mdi-dots-horizontal" size="x-small" variant="flat" v-bind="menuProps" title="Opzioni pasto" />
          </template>
          <v-list density="compact">
            <v-list-item @click="openEdit" prepend-icon="mdi-pencil-outline">
              <v-list-item-title class="text-body-2">Modifica pasto</v-list-item-title>
            </v-list-item>
            <v-list-item @click="removeMeal" prepend-icon="mdi-trash-can-outline" base-color="error">
              <v-list-item-title class="text-body-2">Elimina pasto</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </header>

    <div class="meal-body">
      <FoodTable
        :foods="meal.alimenti"
        @remove="onRemoveFood"
        @update-grams="onUpdateGrams"
      />
    </div>

    <FoodSearchAutocomplete
      @add="onAddFood"
      @custom="customDialog = true"
    />

    <div class="meal-note-row">
      <span class="note-label">Nota:</span>
      <textarea
        class="note-input"
        :value="meal.nota"
        placeholder="Aggiungi una nota (es. cottura, preferenze, sostituti…)"
        rows="1"
        @input="onNoteInput"
      />
    </div>

    <!-- Dialog: alimento manuale -->
    <CustomFoodDialog v-model="customDialog" @submit="onAddFood" @submit-and-save="onAddAndSaveFood" />

    <!-- Dialog: modifica pasto -->
    <v-dialog v-model="editDialog" max-width="420">
      <v-card>
        <v-card-title class="text-body-1 font-weight-medium">Modifica pasto</v-card-title>
        <v-card-text>
          <v-text-field v-model="editForm.nome" label="Nome pasto" class="mb-3" />
          <v-select
            v-model="editForm.tipo"
            :items="MEAL_TYPE_OPTIONS"
            item-title="label"
            item-value="value"
            label="Tipologia"
          />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn class="app-btn app-btn--text" size="small" variant="flat" @click="editDialog = false">Annulla</v-btn>
          <v-btn class="app-btn app-btn--primary" size="small" variant="flat" @click="saveEdit">Salva</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </article>
</template>

<style scoped>
.meal-card {
  border: 1px solid #ebebeb;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: white;
}

.meal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--gray-50);
  border-bottom: 1px solid #ebebeb;
}

.meal-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.meal-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meal-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.meal-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-900);
}

.meal-kcal {
  font-size: 12px;
  color: var(--gray-500);
}

.meal-kcal strong { color: var(--gray-700); }

.meal-body { padding: 0; }

.meal-note-row {
  padding: 6px 14px 10px;
  border-top: 1px solid #f2f2f0;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: white;
}

.note-label {
  font-size: 10px;
  color: var(--gray-500);
  white-space: nowrap;
  margin-top: 5px;
}

.note-input {
  flex: 1;
  border: none;
  background: transparent;
  resize: vertical;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-style: italic;
  color: var(--gray-700);
  outline: none;
  padding: 4px 0;
  line-height: 1.5;
}

.note-input::placeholder {
  color: var(--gray-300);
  font-style: italic;
}

@media (max-width: 600px) {
  .meal-header { padding: 10px 12px; }
  .meal-name { font-size: 12px; }
  .meal-kcal { font-size: 11px; }
  .meal-note-row { padding: 6px 10px 10px; }
}
</style>
