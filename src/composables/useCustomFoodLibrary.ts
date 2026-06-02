/**
 * useCustomFoodLibrary — libreria alimenti custom persistita su localStorage.
 * Singleton di modulo: tutti i componenti condividono lo stesso stato reattivo.
 */
import { ref } from 'vue'
import type { FoodIndexEntry, NutritionPer100g } from '@/types'

const STORAGE_KEY = 'custom-food-library-v1'

/** ID negativi per non collidere con gli ID numerici del database. */
let nextId = -1

function loadFromStorage(): FoodIndexEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as FoodIndexEntry[]
    // Aggiorna nextId per evitare collisioni dopo il reload
    for (const entry of parsed) {
      if (entry.id <= nextId) nextId = entry.id - 1
    }
    return parsed
  } catch {
    return []
  }
}

function saveToStorage(items: FoodIndexEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // quota exceeded o private browsing: silenzioso
  }
}

// ── Stato singleton ────────────────────────────────────────────
const items = ref<FoodIndexEntry[]>(loadFromStorage())

export function useCustomFoodLibrary() {
  function save(nome: string, per100g: NutritionPer100g): FoodIndexEntry {
    const entry: FoodIndexEntry = {
      id: nextId--,
      nome,
      categoria: 'Personalizzato',
      file: '',
      custom: true,
      per100gInline: per100g
    }
    items.value = [entry, ...items.value]
    saveToStorage(items.value)
    return entry
  }

  function remove(id: number): void {
    items.value = items.value.filter((e) => e.id !== id)
    saveToStorage(items.value)
  }

  function update(id: number, nome: string, per100g: NutritionPer100g): void {
    items.value = items.value.map((e) =>
      e.id === id ? { ...e, nome, per100gInline: per100g } : e
    )
    saveToStorage(items.value)
  }

  return { items, save, remove, update }
}
