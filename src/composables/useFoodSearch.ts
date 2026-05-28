/**
 * Composable per la ricerca alimenti.
 * ---------------------------------------------------------------
 * Espone uno stato reattivo (results, loading, error) e una
 * funzione `search(query)` da agganciare a un input.
 * L'indice viene caricato la prima volta in modo trasparente.
 */
import { ref, shallowRef } from 'vue'
import type { FoodIndexEntry } from '@/types'
import { loadFoodIndex, searchFoodIndex } from '@/services/foodService'

export function useFoodSearch() {
  const indexLoaded = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const results = shallowRef<FoodIndexEntry[]>([])

  // Cache locale dell'indice già caricato (non reattivo, sola lettura).
  let cache: FoodIndexEntry[] | null = null

  async function ensureIndex(): Promise<FoodIndexEntry[]> {
    if (cache) return cache
    loading.value = true
    error.value = null
    try {
      cache = await loadFoodIndex()
      indexLoaded.value = true
      return cache
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Errore sconosciuto'
      cache = []
      return cache
    } finally {
      loading.value = false
    }
  }

  async function search(query: string): Promise<void> {
    const list = await ensureIndex()
    results.value = searchFoodIndex(list, query, 30)
  }

  return {
    indexLoaded,
    loading,
    error,
    results,
    search,
    ensureIndex
  }
}
