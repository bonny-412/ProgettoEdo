/**
 * Configurazione Vuetify
 * ---------------------------------------------------------------
 * Tema verde derivato dal mockup HTML del dott. Edoardo Dietista.
 * I valori sono allineati alle variabili CSS in `styles/main.css`
 * così che componenti Vuetify e CSS custom condividano la stessa
 * palette.
 */
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import { it } from 'vuetify/locale'

const edoardoLight: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    'surface-variant': '#FAFAF8',
    'on-surface-variant': '#3D3D3D',

    primary: '#2E7D32',           // green-800
    'primary-darken-1': '#1B4332',
    'on-primary': '#FFFFFF',

    secondary: '#3FA34D',         // green-600
    'on-secondary': '#FFFFFF',

    accent: '#5CC45C',            // green-400
    success: '#3FA34D',
    info: '#3B82F6',
    warning: '#F59E0B',
    error: '#EF4444',

    // Colori extra esposti come variabili Vuetify per coerenza
    'green-50': '#F0FAF1',
    'green-100': '#D8F3DC',
    'gray-50': '#FAFAF8',
    'gray-100': '#F4F4F2',
    'gray-300': '#C4C4C4',
    'gray-500': '#6B6B6B',
    'gray-700': '#3D3D3D',
    'gray-900': '#1A1A1A'
  }
}

export const vuetify = createVuetify({
  locale: {
    locale: 'it',
    messages: { it }
  },
  theme: {
    defaultTheme: 'edoardoLight',
    themes: { edoardoLight }
  },
  defaults: {
    VBtn: {
      style: 'text-transform: none; letter-spacing: 0; font-weight: 500;'
    },
    VCard: { rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'compact', hideDetails: 'auto' },
    VSelect: { variant: 'outlined', density: 'compact', hideDetails: 'auto' },
    VAutocomplete: { variant: 'outlined', density: 'compact', hideDetails: 'auto' }
  }
})
