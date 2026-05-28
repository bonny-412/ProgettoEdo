/**
 * Dati di default usati al primo avvio.
 * Niente persistenza: ad ogni reload l'app riparte da questi valori.
 */
import type { DayKey, DayPlan, Meal, MealType, WeekPlan } from '@/types'
import { uid } from '@/utils/uid'

/** Ordine dei giorni (lunedì → domenica). */
export const DAY_KEYS: DayKey[] = [
  'lunedi',
  'martedi',
  'mercoledi',
  'giovedi',
  'venerdi',
  'sabato',
  'domenica'
]

/** Etichette leggibili dei giorni. */
export const DAY_LABELS: Record<DayKey, string> = {
  lunedi: 'Lunedì',
  martedi: 'Martedì',
  mercoledi: 'Mercoledì',
  giovedi: 'Giovedì',
  venerdi: 'Venerdì',
  sabato: 'Sabato',
  domenica: 'Domenica'
}

/** Template dei 6 pasti predefiniti. */
interface MealTemplate {
  nome: string
  tipo: MealType
}

const DEFAULT_MEAL_TEMPLATES: MealTemplate[] = [
  { nome: 'Colazione',           tipo: 'colazione' },
  { nome: 'Spuntino mattina',    tipo: 'spuntino'  },
  { nome: 'Pranzo',              tipo: 'pranzo'    },
  { nome: 'Spuntino pomeriggio', tipo: 'merenda'   },
  { nome: 'Cena',                tipo: 'cena'      },
  { nome: 'Spuntino sera',       tipo: 'spuntino'  }
]

/** Crea la lista di pasti predefiniti, ognuno con uid univoco. */
function buildDefaultMeals(): Meal[] {
  return DEFAULT_MEAL_TEMPLATES.map<Meal>((t) => ({
    uid: uid('meal'),
    nome: t.nome,
    tipo: t.tipo,
    alimenti: [],
    nota: ''
  }))
}

/** Crea un singolo `DayPlan` vuoto con i 6 pasti predefiniti. */
export function buildDefaultDay(key: DayKey): DayPlan {
  return {
    key,
    label: DAY_LABELS[key],
    meals: buildDefaultMeals()
  }
}

/** Crea un piano settimanale completo (7 giorni × 6 pasti). */
export function buildDefaultWeekPlan(): WeekPlan {
  const week = {} as WeekPlan
  for (const k of DAY_KEYS) {
    week[k] = buildDefaultDay(k)
  }
  return week
}

/** Colore (CSS) associato al tipo di pasto, identico al mockup. */
export const MEAL_TYPE_COLOR: Record<MealType, string> = {
  colazione: '#F59E0B',
  spuntino:  '#10B981',
  pranzo:    '#3B82F6',
  merenda:   '#F97316',
  cena:      '#8B5CF6',
  altro:     '#6B6B6B'
}

/** Tipi di pasto disponibili nel form "modifica pasto". */
export const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'colazione', label: 'Colazione' },
  { value: 'spuntino',  label: 'Spuntino'  },
  { value: 'pranzo',    label: 'Pranzo'    },
  { value: 'merenda',   label: 'Merenda'   },
  { value: 'cena',      label: 'Cena'      },
  { value: 'altro',     label: 'Altro'     }
]
