<script setup lang="ts">
/**
 * FoodTable — tabella alimenti di un pasto.
 * Colonne: alimento, grammi, kcal, proteine, grassi, carbo,
 *          zuccheri, fibra, ferro, calcio, elimina.
 * Su mobile la tabella scorre orizzontalmente mantenendo l'header visibile.
 */
import type { Food } from '@/types'
import { extendedForFood, round0, round1 } from '@/utils/nutrition'

defineProps<{
  foods: Food[]
}>()

const emit = defineEmits<{
  (e: 'remove', foodUid: string): void
  (e: 'update-grams', foodUid: string, grams: number): void
}>()

function fmt(v: number | undefined, decimals = 1): string {
  if (v == null) return '—'
  return decimals === 0 ? String(round0(v)) : String(round1(v))
}

function onGramsInput(uid: string, ev: Event): void {
  const target = ev.target as HTMLInputElement
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
    if (dotIndex !== -1 && val.length - dotIndex > 2) { ev.preventDefault(); return }
    return
  }
  ev.preventDefault()
}
</script>

<template>
  <div class="food-table-wrap">
    <table class="food-table">
      <thead>
        <tr class="food-row-header">
          <th class="col-name">Alimento</th>
          <th class="ta-right">Qtà</th>
          <th class="ta-right">Kcal</th>
          <th class="ta-right">Prot.</th>
          <th class="ta-right">Gras.</th>
          <th class="ta-right">Carb.</th>
          <th class="ta-right">Zucc.</th>
          <th class="ta-right">Fibra</th>
          <th class="ta-right">Ferro</th>
          <th class="ta-right">Calcio</th>
          <th class="ta-right">Sodio</th>
          <th />
        </tr>
      </thead>

      <tbody>
        <tr v-if="foods.length === 0">
          <td colspan="12" class="food-empty">Nessun alimento — aggiungine uno qui sotto.</td>
        </tr>

        <tr v-for="food in foods" :key="food.uid" class="food-row">
          <td class="food-name" :title="food.nome">{{ food.nome }}</td>

          <td class="food-qty tabular">
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
          </td>

          <td class="food-num tabular">{{ fmt(extendedForFood(food).kcal, 0) }}</td>
          <td class="food-num tabular">{{ fmt(extendedForFood(food).proteine) }}</td>
          <td class="food-num tabular">{{ fmt(extendedForFood(food).grassi) }}</td>
          <td class="food-num tabular">{{ fmt(extendedForFood(food).carboidrati) }}</td>
          <td class="food-num tabular">{{ fmt(extendedForFood(food).zuccheri) }}</td>
          <td class="food-num tabular">{{ fmt(extendedForFood(food).fibra) }}</td>
          <td class="food-num tabular food-num--mg">{{ fmt(extendedForFood(food).ferro) }}<span v-if="extendedForFood(food).ferro != null" class="unit-mg">mg</span></td>
          <td class="food-num tabular food-num--mg">{{ fmt(extendedForFood(food).calcio) }}<span v-if="extendedForFood(food).calcio != null" class="unit-mg">mg</span></td>
          <td class="food-num tabular food-num--mg">{{ fmt(extendedForFood(food).sodio) }}<span v-if="extendedForFood(food).sodio != null" class="unit-mg">mg</span></td>

          <td class="col-del">
            <v-btn
              class="app-btn app-btn--icon-xs"
              icon="mdi-close"
              size="x-small"
              variant="flat"
              title="Rimuovi alimento"
              @click="emit('remove', food.uid)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.food-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: white;
}

.food-table {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;
  font-size: 12px;
  table-layout: fixed;
}

/* Larghezze colonne */
.col-name    { width: 180px; }
.food-table th:nth-child(2)  { width: 92px; }  /* Qtà */
.food-table th:nth-child(3)  { width: 48px; }  /* Kcal */
.food-table th:nth-child(4)  { width: 46px; }  /* Prot */
.food-table th:nth-child(5)  { width: 46px; }  /* Gras */
.food-table th:nth-child(6)  { width: 46px; }  /* Carb */
.food-table th:nth-child(7)  { width: 46px; }  /* Zucc */
.food-table th:nth-child(8)  { width: 46px; }  /* Fibra */
.food-table th:nth-child(9)  { width: 54px; }  /* Ferro */
.food-table th:nth-child(10) { width: 58px; }  /* Calcio */
.food-table th:nth-child(11) { width: 56px; }  /* Sodio */
.food-table th:nth-child(12) { width: 40px; }  /* del */

.food-row-header th {
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--gray-500);
  font-weight: 400;
  padding: 6px 14px 4px;
  text-align: right;
  white-space: nowrap;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.food-row-header th.col-name { text-align: left; }

.food-row td {
  padding: 8px 6px;
  border-bottom: 1px solid #f2f2f0;
  vertical-align: middle;
}

.food-row td:first-child { padding-left: 14px; }
.food-row td:last-child  { padding-right: 14px; }
.food-row:last-child td  { border-bottom: none; }

.ta-right { text-align: right; }

.food-name {
  color: var(--gray-900);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
}

.food-qty {
  text-align: right;
}

.qty-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.qty-edit {
  width: 64px;
  border: 1px solid var(--gray-300);
  background: var(--gray-50);
  text-align: right;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-900);
  padding: 3px 18px 3px 4px;
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
  right: 5px;
  font-size: 11px;
  color: var(--gray-500);
  pointer-events: none;
  user-select: none;
}

.food-num {
  color: var(--gray-700);
  text-align: right;
  white-space: nowrap;
}

.unit-mg {
  font-size: 9px;
  color: var(--gray-400);
  margin-left: 1px;
}

.col-del {
  text-align: center;
}

.food-empty {
  padding: 14px;
  text-align: center;
  font-size: 12px;
  color: var(--gray-500);
  font-style: italic;
}
</style>
