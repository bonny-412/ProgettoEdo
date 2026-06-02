/**
 * Modelli di dominio dell'applicazione.
 * ---------------------------------------------------------------
 * Tutto è tipizzato per offrire autocompletamento e type-safety
 * nei componenti, store e servizi.
 */

/** Identificativi dei giorni della settimana (chiavi interne). */
export type DayKey =
  | 'lunedi'
  | 'martedi'
  | 'mercoledi'
  | 'giovedi'
  | 'venerdi'
  | 'sabato'
  | 'domenica'

/** Valori nutrizionali (sempre per 100 g) usati nei calcoli. */
export interface NutritionPer100g {
  kcal: number
  proteine: number
  carboidrati: number
  grassi: number
  zuccheri?: number
  fibra?: number
  ferro?: number    // mg
  calcio?: number   // mg
  acqua?: number    // g
}

/** Alimento contenuto in un pasto (con quantità in grammi). */
export interface Food {
  /** ID univoco locale (UUID-like, generato al volo). */
  uid: string
  /** Eventuale ID dell'alimento sul database (opzionale per i custom). */
  sourceId?: number
  /** Nome leggibile mostrato in tabella. */
  nome: string
  /** Quantità servita, in grammi (o ml). */
  grammi: number
  /** Valori nutrizionali per 100 g — usati per il ricalcolo. */
  per100g: NutritionPer100g
  /** Flag per distinguere alimenti dal DB vs custom. */
  custom?: boolean
}

/** Pasto (colazione, pranzo, ecc.). */
export interface Meal {
  uid: string
  nome: string
  /** Tipologia di pasto: usata solo per il colore del pallino. */
  tipo: MealType
  alimenti: Food[]
  nota?: string
}

/** Tipologia "logica" del pasto: determina solo il colore del dot. */
export type MealType =
  | 'colazione'
  | 'spuntino'
  | 'pranzo'
  | 'merenda'
  | 'cena'
  | 'altro'

/** Singolo giorno del piano settimanale. */
export interface DayPlan {
  key: DayKey
  label: string
  meals: Meal[]
}

/** Piano alimentare settimanale completo. */
export type WeekPlan = Record<DayKey, DayPlan>

/** Voce dell'indice di ricerca alimenti (foods-index.json). */
export interface FoodIndexEntry {
  id: number
  nome: string
  categoria: string
  file: string
  /** Presente solo per alimenti custom salvati in libreria. */
  custom?: true
  per100gInline?: NutritionPer100g
}

/** Struttura del JSON di dettaglio di un alimento (BDA IEO). */
export interface FoodDetail {
  id: number
  nome: string
  anno?: number
  categoria?: { codice: number; nome: string }
  parte_edibile_percentuale?: number
  valori_per_100g: {
    energia: { kcal: number; kj?: number }
    proteine_g: number
    lipidi_g: number
    carboidrati_g: number
    fibra_g?: number
    acqua_g?: number
    alcol?: number
    colesterolo_mg?: number
  }
  minerali?: {
    ferro_mg?: number
    calcio_mg?: number
  }
  zuccheri?: {
    glucosio_g?: number
    fruttosio_g?: number
    galattosio_g?: number
  }
  [extra: string]: unknown
}

/** Totali nutrizionali aggregati (pasto / giorno / settimana). */
export interface NutritionTotals {
  kcal: number
  proteine: number
  carboidrati: number
  grassi: number
  fibra?: number
}

/** Dati paziente mostrati nella patient-bar (in-memory, niente salvataggio). */
export interface PatientInfo {
  nome: string
  dataScheda: string
  obiettivoKcal: number
}
