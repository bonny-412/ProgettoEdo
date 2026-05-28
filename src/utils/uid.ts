/**
 * Generatore di ID univoci semplici (sufficienti per le chiavi locali).
 * Non usiamo `crypto.randomUUID` per massima compatibilità browser.
 */
export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 9)}`
}
