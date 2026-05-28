/**
 * useWeekPlan — stato condiviso del piano settimanale.
 * ---------------------------------------------------------------
 * Sostituisce uno store Pinia con un semplice pattern "module-level
 * singleton": le `ref` sono dichiarate fuori dalla funzione e quindi
 * condivise da tutti i componenti che importano il composable.
 *
 * L'app è single-page e non persiste nulla: ad ogni reload riparte
 * dai valori di default in `data/defaults.ts`.
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue'

import type {
  DayKey,
  DayPlan,
  Food,
  Meal,
  MealType,
  NutritionTotals,
  PatientInfo
} from '@/types'
import { buildDefaultWeekPlan, DAY_KEYS, DAY_LABELS } from '@/data/defaults'
import {
  emptyTotals,
  sumTotals,
  totalsForDay,
  totalsForMeal
} from '@/utils/nutrition'
import { uid } from '@/utils/uid'

// ── STATO CONDIVISO (singleton di modulo) ─────────────────────
const weekPlan = ref(buildDefaultWeekPlan())
const selectedDayKey = ref<DayKey>('lunedi')

const patient = ref<PatientInfo>({
  nome: 'Edoardo Haag',
  dataScheda: new Date().toISOString().slice(0, 10),
  obiettivoKcal: 2000
})

// ── INTERFACCIA PUBBLICA ──────────────────────────────────────
export interface UseWeekPlan {
  // state (ref/computed)
  weekPlan: Ref<ReturnType<typeof buildDefaultWeekPlan>>
  selectedDayKey: Ref<DayKey>
  patient: Ref<PatientInfo>

  // getters
  days: ComputedRef<DayPlan[]>
  currentDay: ComputedRef<DayPlan>
  dailyTotals: ComputedRef<NutritionTotals>
  kcalPerDay: ComputedRef<Record<DayKey, number>>
  weeklyTotals: ComputedRef<NutritionTotals>
  weeklyAverages: ComputedRef<NutritionTotals>
  activeDaysCount: ComputedRef<number>

  // utility
  totalsForMealUid: (dayKey: DayKey, mealUid: string) => NutritionTotals
  totalsForMeal: typeof totalsForMeal

  // actions
  selectDay: (key: DayKey) => void
  addMeal: (dayKey: DayKey, nome?: string, tipo?: MealType) => Meal
  removeMeal: (dayKey: DayKey, mealUid: string) => void
  updateMeal: (
    dayKey: DayKey,
    mealUid: string,
    patch: Partial<Pick<Meal, 'nome' | 'tipo' | 'nota'>>
  ) => void
  addFood: (dayKey: DayKey, mealUid: string, food: Omit<Food, 'uid'>) => Food
  removeFood: (dayKey: DayKey, mealUid: string, foodUid: string) => void
  updateFood: (
    dayKey: DayKey,
    mealUid: string,
    foodUid: string,
    patch: Partial<Food>
  ) => void
  updatePatient: (patch: Partial<PatientInfo>) => void
  resetAll: () => void

  // costanti
  DAY_LABELS: typeof DAY_LABELS
}

// ── COMPUTED ──────────────────────────────────────────────────
const days = computed<DayPlan[]>(() => DAY_KEYS.map((k) => weekPlan.value[k]))

const currentDay = computed<DayPlan>(() => weekPlan.value[selectedDayKey.value])

const dailyTotals = computed<NutritionTotals>(() => totalsForDay(currentDay.value))

const kcalPerDay = computed<Record<DayKey, number>>(() => {
  const map = {} as Record<DayKey, number>
  for (const k of DAY_KEYS) map[k] = totalsForDay(weekPlan.value[k]).kcal
  return map
})

const weeklyTotals = computed<NutritionTotals>(() =>
  days.value.reduce<NutritionTotals>(
    (acc, d) => sumTotals(acc, totalsForDay(d)),
    emptyTotals()
  )
)

const activeDaysCount = computed<number>(
  () => days.value.filter((d) => d.meals.some((m) => m.alimenti.length > 0)).length
)

const weeklyAverages = computed<NutritionTotals>(() => {
  const n = activeDaysCount.value
  if (n === 0) return emptyTotals()
  const t = weeklyTotals.value
  return {
    kcal: t.kcal / n,
    proteine: t.proteine / n,
    carboidrati: t.carboidrati / n,
    grassi: t.grassi / n
  }
})

// ── HELPERS INTERNI ───────────────────────────────────────────
function findMeal(dayKey: DayKey, mealUid: string): Meal {
  const meal = weekPlan.value[dayKey].meals.find((m) => m.uid === mealUid)
  if (!meal) throw new Error(`Pasto non trovato: ${mealUid}`)
  return meal
}

// ── ACTIONS ───────────────────────────────────────────────────
function selectDay(key: DayKey): void {
  selectedDayKey.value = key
}

function totalsForMealUid(dayKey: DayKey, mealUid: string): NutritionTotals {
  return totalsForMeal(findMeal(dayKey, mealUid))
}

function addMeal(
  dayKey: DayKey,
  nome = 'Nuovo pasto',
  tipo: MealType = 'altro'
): Meal {
  const newMeal: Meal = {
    uid: uid('meal'),
    nome,
    tipo,
    alimenti: [],
    nota: ''
  }
  weekPlan.value[dayKey].meals.push(newMeal)
  return newMeal
}

function removeMeal(dayKey: DayKey, mealUid: string): void {
  const meals = weekPlan.value[dayKey].meals
  const idx = meals.findIndex((m) => m.uid === mealUid)
  if (idx >= 0) meals.splice(idx, 1)
}

function updateMeal(
  dayKey: DayKey,
  mealUid: string,
  patch: Partial<Pick<Meal, 'nome' | 'tipo' | 'nota'>>
): void {
  Object.assign(findMeal(dayKey, mealUid), patch)
}

function addFood(
  dayKey: DayKey,
  mealUid: string,
  food: Omit<Food, 'uid'>
): Food {
  const newFood: Food = { ...food, uid: uid('food') }
  findMeal(dayKey, mealUid).alimenti.push(newFood)
  return newFood
}

function removeFood(dayKey: DayKey, mealUid: string, foodUid: string): void {
  const meal = findMeal(dayKey, mealUid)
  const idx = meal.alimenti.findIndex((f) => f.uid === foodUid)
  if (idx >= 0) meal.alimenti.splice(idx, 1)
}

function updateFood(
  dayKey: DayKey,
  mealUid: string,
  foodUid: string,
  patch: Partial<Food>
): void {
  const food = findMeal(dayKey, mealUid).alimenti.find((f) => f.uid === foodUid)
  if (!food) return
  Object.assign(food, patch)
}

function updatePatient(patch: Partial<PatientInfo>): void {
  patient.value = { ...patient.value, ...patch }
}

function resetAll(): void {
  weekPlan.value = buildDefaultWeekPlan()
  selectedDayKey.value = 'lunedi'
}

// ── COMPOSABLE ────────────────────────────────────────────────
export function useWeekPlan(): UseWeekPlan {
  return {
    // state
    weekPlan,
    selectedDayKey,
    patient,
    // getters
    days,
    currentDay,
    dailyTotals,
    kcalPerDay,
    weeklyTotals,
    weeklyAverages,
    activeDaysCount,
    // utility
    totalsForMealUid,
    totalsForMeal,
    // actions
    selectDay,
    addMeal,
    removeMeal,
    updateMeal,
    addFood,
    removeFood,
    updateFood,
    updatePatient,
    resetAll,
    // costanti
    DAY_LABELS
  }
}
