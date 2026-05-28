/**
 * Servizio caricamento alimenti.
 * ---------------------------------------------------------------
 * - L'INDICE (`/foods/foods-index.json`) viene caricato una volta
 *   al primo utilizzo e tenuto in memoria.
 * - Il DETTAGLIO del singolo alimento (`/foods/<id>.json`) viene
 *   caricato on-demand e cachato in una Map.
 *
 * Nessuna richiesta HTTP duplicata e nessun preload non necessario:
 * l'app può scalare anche con migliaia di alimenti.
 */
import type { FoodDetail, FoodIndexEntry } from '@/types'

const INDEX_URL = '/foods/foods-index.json'
const DETAIL_BASE_URL = '/foods/'

let indexPromise: Promise<FoodIndexEntry[]> | null = null
const detailCache = new Map<number, FoodDetail>()
const inflightDetails = new Map<number, Promise<FoodDetail>>()

/** Carica (o restituisce dalla cache) l'indice completo degli alimenti. */
export function loadFoodIndex(): Promise<FoodIndexEntry[]> {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Impossibile caricare l'indice alimenti (HTTP ${res.status})`)
        }
        return res.json() as Promise<FoodIndexEntry[]>
      })
      .catch((err) => {
        // In caso di errore svuotiamo la promise per consentire un retry.
        indexPromise = null
        throw err
      })
  }
  return indexPromise
}

/**
 * Carica il dettaglio di un alimento.
 * - Restituisce subito il valore cachato se disponibile.
 * - Deduplica le richieste in volo per lo stesso id.
 */
export function loadFoodDetail(entry: FoodIndexEntry): Promise<FoodDetail> {
  const cached = detailCache.get(entry.id)
  if (cached) return Promise.resolve(cached)

  const inflight = inflightDetails.get(entry.id)
  if (inflight) return inflight

  const url = `${DETAIL_BASE_URL}${entry.file}`
  const p = fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Impossibile caricare l'alimento ${entry.id} (HTTP ${res.status})`)
      }
      return res.json() as Promise<FoodDetail>
    })
    .then((detail) => {
      detailCache.set(entry.id, detail)
      inflightDetails.delete(entry.id)
      return detail
    })
    .catch((err) => {
      inflightDetails.delete(entry.id)
      throw err
    })

  inflightDetails.set(entry.id, p)
  return p
}

/**
 * Ricerca semplice case-insensitive sui campi `nome` e `categoria`.
 * Restituisce al massimo `limit` risultati per non sovraccaricare la UI.
 */
export function searchFoodIndex(
  list: FoodIndexEntry[],
  query: string,
  limit = 30
): FoodIndexEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return list.slice(0, limit)

  const results: FoodIndexEntry[] = []
  for (const entry of list) {
    const nome = entry.nome ?? ''
    const categoria = entry.categoria ?? ''
    if (
      nome.toLowerCase().includes(q) ||
      categoria.toLowerCase().includes(q)
    ) {
      results.push(entry)
      if (results.length >= limit) break
    }
  }
  return results
}
