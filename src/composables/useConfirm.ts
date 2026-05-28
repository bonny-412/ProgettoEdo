import { reactive } from 'vue'

interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  dangerous?: boolean
}

interface ConfirmState {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  dangerous: boolean
  resolve: ((value: boolean) => void) | null
}

const state = reactive<ConfirmState>({
  visible: false,
  title: '',
  message: '',
  confirmLabel: 'Conferma',
  cancelLabel: 'Annulla',
  dangerous: false,
  resolve: null
})

export function useConfirm() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    state.title = options.title ?? ''
    state.message = options.message
    state.confirmLabel = options.confirmLabel ?? 'Conferma'
    state.cancelLabel = options.cancelLabel ?? 'Annulla'
    state.dangerous = options.dangerous ?? false
    state.visible = true

    return new Promise<boolean>((resolve) => {
      state.resolve = resolve
    })
  }

  function _accept(): void {
    state.visible = false
    state.resolve?.(true)
    state.resolve = null
  }

  function _cancel(): void {
    state.visible = false
    state.resolve?.(false)
    state.resolve = null
  }

  return { confirm, _state: state, _accept, _cancel }
}
