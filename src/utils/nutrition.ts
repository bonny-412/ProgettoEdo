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
  return { kcal: 0, proteine: 0, carboidrati: 0, grassi: 0, fibra: undefined }
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function round0(n: number): number {
  return Math.round(n)
}

export function calcKcal(
  proteine: number,
  grassi: number,
  carboidrati: number,
  fibra?: number
): number {
  return proteine * 4 + grassi * 9 + carboidrati * 3.75 + (fibra ?? 0) * 2
}

export function macrosForFood(food: Food): NutritionTotals {
  const factor = food.grammi / 100
  const proteine    = food.per100g.proteine    * factor
  const grassi      = food.per100g.grassi      * factor
  const carboidrati = food.per100g.carboidrati * factor
  const fibra       = food.per100g.fibra != null ? food.per100g.fibra * factor : undefined
  return {
    kcal: 0, // verrà ricalcolato da sumTotals/totalsForMeal/totalsForDay
    proteine,
    carboidrati,
    grassi,
    fibra
  }
}

export function extendedForFood(food: Food): NutritionPer100g {
  const factor = food.grammi / 100
  const p = food.per100g
  const proteine    = p.proteine    * factor
  const grassi      = p.grassi      * factor
  const carboidrati = p.carboidrati * factor
  const fibra       = p.fibra != null ? p.fibra * factor : undefined
  return {
    kcal:        calcKcal(proteine, grassi, carboidrati, fibra),
    proteine,
    carboidrati,
    grassi,
    zuccheri:  p.zuccheri * factor,
    fibra,
    ferro:     p.ferro    != null ? p.ferro    * factor : undefined,
    calcio:    p.calcio   != null ? p.calcio   * factor : undefined,
    sodio:     p.sodio    != null ? p.sodio    * factor : undefined,
    acqua:     p.acqua    != null ? p.acqua    * factor : undefined
  }
}

export function sumMacros(a: NutritionTotals, b: NutritionTotals): NutritionTotals {
  const proteine    = a.proteine    + b.proteine
  const grassi      = a.grassi      + b.grassi
  const carboidrati = a.carboidrati + b.carboidrati
  const fibra       = (a.fibra != null || b.fibra != null)
    ? (a.fibra ?? 0) + (b.fibra ?? 0)
    : undefined
  return { kcal: 0, proteine, grassi, carboidrati, fibra }
}

/** @deprecated usa totalsForMeal o totalsForDay */
export function sumTotals(a: NutritionTotals, b: NutritionTotals): NutritionTotals {
  return sumMacros(a, b)
}

export function totalsForMeal(meal: Meal): NutritionTotals {
  const t = meal.alimenti.reduce<NutritionTotals>(
    (acc, f) => sumMacros(acc, macrosForFood(f)),
    emptyTotals()
  )
  return { ...t, kcal: calcKcal(t.proteine, t.grassi, t.carboidrati, t.fibra) }
}

export function totalsForDay(day: DayPlan): NutritionTotals {
  const t = day.meals.reduce<NutritionTotals>(
    (acc, m) => sumMacros(acc, totalsForMeal(m)),
    emptyTotals()
  )
  return { ...t, kcal: calcKcal(t.proteine, t.grassi, t.carboidrati, t.fibra) }
}

export function extractPer100g(detail: FoodDetail): NutritionPer100g {
  const v = detail.valori_per_100g
  const m = detail.minerali
  return {
    kcal:        v && v.energia ? v.energia.kcal : 0,
    proteine:    v ? v.proteine_g    : 0,
    carboidrati: v ? v.carboidrati_g : 0,
    grassi:      v ? v.lipidi_g      : 0,
    fibra:       v ? v.fibra_g       : undefined,
    acqua:       v ? v.acqua_g       : undefined,
    ferro:       m ? m.ferro_mg      : undefined,
    calcio:      m ? m.calcio_mg     : undefined,
    sodio:       m ? m.sodio_mg      : undefined,
    zuccheri:    v ? (v.carboidrati_solubili_g ?? 0) : 0
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
