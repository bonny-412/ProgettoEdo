<script setup lang="ts">
/**
 * CustomFoodLibraryDialog — gestione alimenti salvati manualmente.
 * Mostra la lista con possibilità di modificare (inline) o eliminare.
 */
import { ref, computed } from 'vue'
import type { FoodIndexEntry, NutritionPer100g } from '@/types'
import { useCustomFoodLibrary } from '@/composables/useCustomFoodLibrary'
import { useConfirm } from '@/composables/useConfirm'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { items, remove, update } = useCustomFoodLibrary()
const { confirm } = useConfirm()

// ── Edit inline ───────────────────────────────────────────────
const editingId = ref<number | null>(null)

interface EditForm {
  nome: string
  kcal: string
  proteine: string
  carboidrati: string
  grassi: string
  zuccheri: string
  fibra: string
  ferro: string
  calcio: string
  acqua: string
}

const editForm = ref<EditForm | null>(null)

function startEdit(entry: FoodIndexEntry): void {
  const p = entry.per100gInline!
  editingId.value = entry.id
  editForm.value = {
    nome:        entry.nome,
    kcal:        String(p.kcal        ?? 0),
    proteine:    String(p.proteine    ?? 0),
    carboidrati: String(p.carboidrati ?? 0),
    grassi:      String(p.grassi      ?? 0),
    zuccheri:    p.zuccheri != null ? String(p.zuccheri) : '',
    fibra:       p.fibra    != null ? String(p.fibra)    : '',
    ferro:       p.ferro    != null ? String(p.ferro)    : '',
    calcio:      p.calcio   != null ? String(p.calcio)   : '',
    acqua:       p.acqua    != null ? String(p.acqua)    : ''
  }
}

function cancelEdit(): void {
  editingId.value = null
  editForm.value = null
}

function parseOpt(v: string): number | undefined {
  const n = parseFloat(v)
  return v.trim() !== '' && !isNaN(n) ? n : undefined
}

function saveEdit(): void {
  if (editingId.value == null || !editForm.value) return
  if (!editForm.value.nome.trim()) return
  const per100g: NutritionPer100g = {
    kcal:        parseFloat(editForm.value.kcal)        || 0,
    proteine:    parseFloat(editForm.value.proteine)    || 0,
    carboidrati: parseFloat(editForm.value.carboidrati) || 0,
    grassi:      parseFloat(editForm.value.grassi)      || 0,
    zuccheri:    parseOpt(editForm.value.zuccheri),
    fibra:       parseOpt(editForm.value.fibra),
    ferro:       parseOpt(editForm.value.ferro),
    calcio:      parseOpt(editForm.value.calcio),
    acqua:       parseOpt(editForm.value.acqua)
  }
  update(editingId.value, editForm.value.nome.trim(), per100g)
  cancelEdit()
}

async function handleDelete(entry: FoodIndexEntry): Promise<void> {
  const ok = await confirm({
    title: 'Elimina alimento',
    message: `Vuoi eliminare "${entry.nome}" dalla libreria?`,
    confirmLabel: 'Elimina',
    cancelLabel: 'Annulla',
    dangerous: true
  })
  if (ok) {
    if (editingId.value === entry.id) cancelEdit()
    remove(entry.id)
  }
}

// Filtro ricerca
const query = ref('')
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter((e) => e.nome.toLowerCase().includes(q))
})

// Input numerico decimale
function onDecimalKeydown(ev: KeyboardEvent): void {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (allowed.includes(ev.key)) return
  if ((ev.ctrlKey || ev.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(ev.key.toLowerCase())) return
  const input = ev.target as HTMLInputElement
  if (ev.key === '.' && !input.value.includes('.')) return
  if (/^\d$/.test(ev.key)) return
  ev.preventDefault()
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Libreria alimenti</span>
        <span class="item-count">{{ items.length }} salvati</span>
      </v-card-title>

      <v-card-text class="pt-2">
        <!-- Ricerca -->
        <v-text-field
          v-model="query"
          placeholder="Filtra..."
          prepend-inner-icon="mdi-magnify"
          density="compact"
          variant="outlined"
          hide-details
          class="mb-4"
          clearable
        />

        <!-- Lista vuota -->
        <div v-if="items.length === 0" class="empty-state">
          <p>Nessun alimento salvato.</p>
          <p class="empty-hint">Usa "Aggiungi e salva" nel dialog alimento manuale per salvare qui.</p>
        </div>

        <!-- Nessun risultato filtro -->
        <div v-else-if="filtered.length === 0" class="empty-state">
          <p>Nessun risultato per "{{ query }}".</p>
        </div>

        <!-- Lista -->
        <div v-else class="food-list">
          <div
            v-for="entry in filtered"
            :key="entry.id"
            class="food-row"
            :class="{ 'food-row--editing': editingId === entry.id }"
          >
            <!-- Riga principale -->
            <div class="food-row-header">
              <div class="food-row-name">{{ entry.nome }}</div>
              <div class="food-row-actions">
                <v-btn
                  v-if="editingId !== entry.id"
                  icon="mdi-pencil-outline"
                  size="x-small"
                  variant="text"
                  color="grey"
                  @click="startEdit(entry)"
                />
                <v-btn
                  icon="mdi-trash-can-outline"
                  size="x-small"
                  variant="text"
                  color="red"
                  @click="handleDelete(entry)"
                />
              </div>
            </div>

            <!-- Macros in pillole (solo quando non in edit) -->
            <div v-if="editingId !== entry.id" class="food-row-macros">
              <span class="macro-pill">P {{ entry.per100gInline?.proteine ?? 0 }}g</span>
              <span class="macro-pill">C {{ entry.per100gInline?.carboidrati ?? 0 }}g</span>
              <span class="macro-pill">G {{ entry.per100gInline?.grassi ?? 0 }}g</span>
              <span v-if="entry.per100gInline?.fibra != null" class="macro-pill">F {{ entry.per100gInline.fibra }}g</span>
            </div>

            <!-- Form inline di modifica -->
            <div v-if="editingId === entry.id && editForm" class="edit-form">
              <v-text-field
                v-model="editForm.nome"
                label="Nome"
                density="compact"
                variant="outlined"
                hide-details
                class="mb-2"
              />
              <div class="edit-grid">
                <v-text-field v-model="editForm.kcal"        label="Kcal"        density="compact" variant="outlined" hide-details suffix="kcal" type="text" inputmode="decimal" @keydown="onDecimalKeydown" />
                <v-text-field v-model="editForm.proteine"    label="Proteine"    density="compact" variant="outlined" hide-details suffix="g"    type="text" inputmode="decimal" @keydown="onDecimalKeydown" />
                <v-text-field v-model="editForm.carboidrati" label="Carboidrati" density="compact" variant="outlined" hide-details suffix="g"    type="text" inputmode="decimal" @keydown="onDecimalKeydown" />
                <v-text-field v-model="editForm.grassi"      label="Grassi"      density="compact" variant="outlined" hide-details suffix="g"    type="text" inputmode="decimal" @keydown="onDecimalKeydown" />
                <v-text-field v-model="editForm.zuccheri"    label="Zuccheri"    density="compact" variant="outlined" hide-details suffix="g"    type="text" inputmode="decimal" placeholder="—" @keydown="onDecimalKeydown" />
                <v-text-field v-model="editForm.fibra"       label="Fibra"       density="compact" variant="outlined" hide-details suffix="g"    type="text" inputmode="decimal" placeholder="—" @keydown="onDecimalKeydown" />
                <v-text-field v-model="editForm.ferro"       label="Ferro"       density="compact" variant="outlined" hide-details suffix="mg"   type="text" inputmode="decimal" placeholder="—" @keydown="onDecimalKeydown" />
                <v-text-field v-model="editForm.calcio"      label="Calcio"      density="compact" variant="outlined" hide-details suffix="mg"   type="text" inputmode="decimal" placeholder="—" @keydown="onDecimalKeydown" />
                <v-text-field v-model="editForm.acqua"       label="Acqua"       density="compact" variant="outlined" hide-details suffix="g"    type="text" inputmode="decimal" placeholder="—" @keydown="onDecimalKeydown" />
              </div>
              <div class="edit-actions">
                <v-btn size="small" variant="text" @click="cancelEdit">Annulla</v-btn>
                <v-btn size="small" variant="flat" class="btn-save-edit" @click="saveEdit">Salva modifiche</v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn class="app-btn app-btn--primary" variant="flat" @click="emit('update:modelValue', false)">Chiudi</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.item-count {
  font-size: 12px;
  color: var(--gray-400);
  font-weight: 400;
}

.empty-state {
  text-align: center;
  padding: 32px 0;
  color: var(--gray-500);
  font-size: 14px;
}

.empty-hint {
  font-size: 12px;
  color: var(--gray-400);
  margin-top: 4px;
}

.food-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.food-row {
  border: 1px solid #ebebeb;
  border-radius: var(--radius-md);
  padding: 10px 12px;
  background: var(--gray-50);
  transition: border-color 0.15s;
}

.food-row--editing {
  border-color: var(--green-600);
  background: #fff;
}

.food-row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.food-row-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-900);
}

.food-row-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.food-row-macros {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.macro-pill {
  font-size: 11px;
  color: var(--gray-500);
  background: #ebebeb;
  border-radius: 20px;
  padding: 1px 8px;
}

.edit-form {
  margin-top: 10px;
}

.edit-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-save-edit {
  background: var(--green-600) !important;
  color: #fff !important;
  font-size: 12px;
}

@media (max-width: 500px) {
  .edit-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
