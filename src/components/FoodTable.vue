<script setup lang="ts">
/**
 * FoodTable — tabella alimenti di un pasto.
 * Layout 7 colonne identico al mockup (alimento, qtà, kcal, prot,
 * carb, gras, azione elimina). Sotto i 720 px diventa una griglia
 * a 4 colonne con righe sovrapposte; sotto i 380 px font ridotto.
 */
import type { Food } from '@/types'
import { macrosForFood, round0, round1 } from '@/utils/nutrition'

defineProps<{
  foods: Food[]
}>()

const emit = defineEmits<{
  (e: 'remove', foodUid: string): void
  (e: 'update-grams', foodUid: string, grams: number): void
}>()

function onGramsInput(uid: string, ev: Event): void {
  const target = ev.target as HTMLInputElement
  // Sanitizza: solo cifre, un punto, max 2 decimali (es. incolla)
  const cleaned = target.value.replace(/[^\d.]/g, '').replace(/^(\d*\.?\d{0,2}).*$/, '$1')
  if (target.value !== cleaned) target.value = cleaned
  const value = Math.max(0, parseFloat(cleaned) || 0)
  emit('update-grams', uid, value)
}

function onGramsKeydown(ev: KeyboardEvent): void {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
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
</script>

<template>
  <div class="food-table">
    <div class="food-row food-row-header">
      <span>Alimento</span>
      <span class="ta-right">Qtà</span>
      <span class="ta-right">Kcal</span>
      <span class="ta-right">Prot.</span>
      <span class="ta-right">Carb.</span>
      <span class="ta-right">Gras.</span>
      <span />
    </div>

    <template v-if="foods.length === 0">
      <div class="food-empty">Nessun alimento — aggiungine uno qui sotto.</div>
    </template>

    <div
      v-for="food in foods"
      :key="food.uid"
      class="food-row"
    >
      <span class="food-name" :title="food.nome">{{ food.nome }}</span>

      <span class="food-qty tabular">
        <span class="qty-wrap">
          <input
            class="qty-edit"
            type="text"
            inputmode="decimal"
            :value="food.grammi"
            @input="(ev) => onGramsInput(food.uid, ev)"
            @keydown="onGramsKeydown"
          />
          <span class="qty-unit">g</span>
        </span>
      </span>

      <span class="food-num tabular">{{ round0(macrosForFood(food).kcal) }}</span>
      <span class="food-num tabular">{{ round1(macrosForFood(food).proteine) }}</span>
      <span class="food-num tabular">{{ round1(macrosForFood(food).carboidrati) }}</span>
      <span class="food-num tabular">{{ round1(macrosForFood(food).grassi) }}</span>

      <v-btn
        class="app-btn app-btn--icon-xs"
        icon="mdi-close"
        size="x-small"
        variant="flat"
        title="Rimuovi alimento"
        @click="emit('remove', food.uid)"
      />
    </div>
  </div>
</template>

<style scoped>
.food-table {
  background: white;
}

.food-row {
  display: grid;
  grid-template-columns: 1fr 92px 56px 56px 56px 56px 32px;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 1px solid #f2f2f0;
  font-size: 12px;
}

.food-row:last-child { border-bottom: none; }

.food-row-header {
  background: transparent;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--gray-500);
  font-weight: 400;
  padding: 6px 14px 4px;
}

.ta-right { text-align: right; }

.food-name {
  color: var(--gray-900);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.food-qty {
  display: inline-flex;
  justify-content: flex-end;
}

.qty-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.qty-edit {
  width: 72px;
  border: 1px solid var(--gray-300);
  background: var(--gray-50);
  text-align: right;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-900);
  padding: 3px 22px 3px 6px;
  border-radius: 4px;
  outline: none;
  -moz-appearance: textfield;
  transition: border-color 0.15s, background 0.15s;
}

.qty-edit::-webkit-outer-spin-button,
.qty-edit::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.qty-edit:hover {
  border-color: var(--green-600);
  background: var(--green-50);
}

.qty-edit:focus {
  border-color: var(--green-600);
  background: white;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--green-600) 15%, transparent);
}

.qty-unit {
  position: absolute;
  right: 7px;
  font-size: 11px;
  color: var(--gray-500);
  pointer-events: none;
  user-select: none;
}

.food-num {
  color: var(--gray-700);
  text-align: right;
}

.food-empty {
  padding: 14px;
  text-align: center;
  font-size: 12px;
  color: var(--gray-500);
  font-style: italic;
}

@media (max-width: 720px) {
  .food-row {
    grid-template-columns: 1fr 70px 48px 32px;
    grid-template-areas:
      'name name name del'
      'qty kcal prot del'
      'qty carb gras del';
    gap: 4px 6px;
    padding: 8px 10px;
  }

  .food-row :nth-child(1) { grid-area: name; }
  .food-row :nth-child(2) { grid-area: qty; }
  .food-row :nth-child(3) { grid-area: kcal; }
  .food-row :nth-child(4) { grid-area: prot; }
  .food-row :nth-child(5) { grid-area: carb; }
  .food-row :nth-child(6) { grid-area: gras; }
  .food-row :nth-child(7) { grid-area: del; }

  .food-row-header { display: none; }
}

@media (max-width: 380px) {
  .food-row {
    font-size: 11px;
    grid-template-columns: 1fr 60px 42px 28px;
  }
  .qty-edit { width: 44px; font-size: 11px; }
}
</style>
