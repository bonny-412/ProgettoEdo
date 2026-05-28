/**
 * Utility nutrizionali pure.
 */
import type {
  Food,
  FoodDetail,
  Meal,
  NutritionPer100g,
  NutritionTotals,
  DayPlan
} from '@/types'

export function emptyTotals(): NutritionTotals {
  return { kcal: 0, proteine: 0, carboidrati: 0, grassi: 0 }
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function round0(n: number): number {
  return Math.round(n)
}

export function macrosForFood(food: Food): NutritionTotals {
  const factor = food.grammi / 100
  return {
    kcal: food.per100g.kcal * factor,
    proteine: food.per100g.proteine * factor,
    carboidrati: food.per100g.carboidrati * factor,
    grassi: food.per100g.grassi * factor
  }
}

export function extendedForFood(food: Food): NutritionPer100g {
  const factor = food.grammi / 100
  const p = food.per100g
  return {
    kcal:        p.kcal        * factor,
    proteine:    p.proteine    * factor,
    carboidrati: p.carboidrati * factor,
    grassi:      p.grassi      * factor,
    zuccheri:  p.zuccheri != null ? p.zuccheri * factor : undefined,
    fibra:     p.fibra    != null ? p.fibra    * factor : undefined,
    ferro:     p.ferro    != null ? p.ferro    * factor : undefined,
    calcio:    p.calcio   != null ? p.calcio   * factor : undefined
  }
}

export function sumTotals(a: NutritionTotals, b: NutritionTotals): NutritionTotals {
  return {
    kcal: a.kcal + b.kcal,
    proteine: a.proteine + b.proteine,
    carboidrati: a.carboidrati + b.carboidrati,
    grassi: a.grassi + b.grassi
  }
}

export function totalsForMeal(meal: Meal): NutritionTotals {
  return meal.alimenti.reduce<NutritionTotals>(
    (acc, f) => sumTotals(acc, macrosForFood(f)),
    emptyTotals()
  )
}

export function totalsForDay(day: DayPlan): NutritionTotals {
  return day.meals.reduce<NutritionTotals>(
    (acc, m) => sumTotals(acc, totalsForMeal(m)),
    emptyTotals()
  )
}

export function extractPer100g(detail: FoodDetail): NutritionPer100g {
  const v = detail.valori_per_100g
  const z = detail.zuccheri
  const m = detail.minerali
  let zuccheriTot: number | undefined
  if (z != null) {
    zuccheriTot = (z.glucosio_g || 0) + (z.fruttosio_g || 0) + (z.galattosio_g || 0)
  }
  return {
    kcal:        v && v.energia ? v.energia.kcal : 0,
    proteine:    v ? v.proteine_g    : 0,
    carboidrati: v ? v.carboidrati_g : 0,
    grassi:      v ? v.lipidi_g      : 0,
    fibra:       v ? v.fibra_g       : undefined,
    ferro:       m ? m.ferro_mg      : undefined,
    calcio:      m ? m.calcio_mg     : undefined,
    zuccheri:    zuccheriTot
  }
}

export function capitalize(text: string): string {
  if (!text) return ''
  const lower = text.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

export function formatKcal(n: number): string {
  return new Intl.NumberFormat('it-IT').format(round0(n))
}

export function percentOf(value: number, goal: number): number {
  if (!goal || goal <= 0) return 0
  return Math.min(100, Math.max(0, (value / goal) * 100))
}
