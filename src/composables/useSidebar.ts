import { ref } from 'vue'

/**
 * useSidebar — stato condiviso per la sidebar a scomparsa su mobile.
 * Il ref è a livello di modulo: tutti i componenti leggono e scrivono
 * sullo stesso valore senza bisogno di un provider/store dedicato.
 */
const isSidebarOpen = ref(false)

export function useSidebar() {
  return {
    isSidebarOpen,
    openSidebar:  () => { isSidebarOpen.value = true },
    closeSidebar: () => { isSidebarOpen.value = false },
    toggleSidebar: () => { isSidebarOpen.value = !isSidebarOpen.value }
  }
}
