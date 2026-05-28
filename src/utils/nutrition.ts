/**
 * Utility nutrizionali pure — nessuna dipendenza da Vue/Pinia.
 * Usabili sia dai componenti che dallo store / test unitari.
 */
import type {
  Food,
  FoodDetail,
  Meal,
  NutritionPer100g,
  NutritionTotals,
  DayPlan
} from '@/types'

/** Crea un oggetto vuoto di totali. */
export function emptyTotals(): NutritionTotals {
  return { kcal: 0, proteine: 0, carboidrati: 0, grassi: 0 }
}

/** Arrotonda al primo decimale (gestione "pulita" dei numeri). */
export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** Arrotonda all'intero. */
export function round0(n: number): number {
  return Math.round(n)
}

/**
 * Calcola i macro di un alimento in base alla quantità.
 * I valori di partenza sono sempre per 100 g.
 */
export function macrosForFood(food: Food): NutritionTotals {
  const factor = food.grammi / 100
  return {
    kcal: food.per100g.kcal * factor,
    proteine: food.per100g.proteine * factor,
    carboidrati: food.per100g.carboidrati * factor,
    grassi: food.per100g.grassi * factor
  }
}

/** Somma due totali (immutabile). */
export function sumTotals(
  a: NutritionTotals,
  b: NutritionTotals
): NutritionTotals {
  return {
    kcal: a.kcal + b.kcal,
    proteine: a.proteine + b.proteine,
    carboidrati: a.carboidrati + b.carboidrati,
    grassi: a.grassi + b.grassi
  }
}

/** Totali nutrizionali di un pasto. */
export function totalsForMeal(meal: Meal): NutritionTotals {
  return meal.alimenti.reduce<NutritionTotals>(
    (acc, f) => sumTotals(acc, macrosForFood(f)),
    emptyTotals()
  )
}

/** Totali nutrizionali di un giorno. */
export function totalsForDay(day: DayPlan): NutritionTotals {
  return day.meals.reduce<NutritionTotals>(
    (acc, m) => sumTotals(acc, totalsForMeal(m)),
    emptyTotals()
  )
}

/**
 * Estrae da un dettaglio JSON (formato BDA IEO) i valori per 100 g
 * nella forma semplificata usata dall'app.
 */
export function extractPer100g(detail: FoodDetail): NutritionPer100g {
  const v = detail.valori_per_100g
  return {
    kcal: v?.energia?.kcal ?? 0,
    proteine: v?.proteine_g ?? 0,
    carboidrati: v?.carboidrati_g ?? 0,
    grassi: v?.lipidi_g ?? 0
  }
}

/** Capitalizza la prima lettera, lascia il resto in lowercase. */
export function capitalize(text: string): string {
  if (!text) return ''
  const lower = text.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

/** Formatta un numero kcal con separatore migliaia "." (it-IT). */
export function formatKcal(n: number): string {
  return new Intl.NumberFormat('it-IT').format(round0(n))
}

/** Percentuale rispetto a un obiettivo (clamp 0–100). */
export function percentOf(value: number, goal: number): number {
  if (!goal || goal <= 0) return 0
  return Math.min(100, Math.max(0, (value / goal) * 100))
}
