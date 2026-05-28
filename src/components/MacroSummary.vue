<script setup lang="ts">
/**
 * MacroSummary — 4 card con kcal/proteine/carboidrati/grassi del giorno.
 * Le barre di progresso usano obiettivi proporzionali al target kcal:
 *   - proteine: 1.2 g/kcal × peso target (qui semplificato con obiettivo 25% kcal/4)
 *   - carbo:    50% kcal / 4
 *   - grassi:   30% kcal / 9
 * Sono indicatori visivi, non valori clinici prescrittivi.
 */
import { computed } from 'vue'
import { useWeekPlan } from '@/composables/useWeekPlan'
import { formatKcal, percentOf, round0 } from '@/utils/nutrition'

const plan = useWeekPlan()

const macros = computed(() => {
  const t = plan.dailyTotals.value
  const obiettivo = plan.patient.value.obiettivoKcal || 0

  // Target macro (semplificati): 25% proteine, 50% carbo, 25% grassi
  const targetProt = (obiettivo * 0.25) / 4
  const targetCarbs = (obiettivo * 0.5) / 4
  const targetFats = (obiettivo * 0.25) / 9

  return {
    kcal: {
      value: t.kcal,
      target: obiettivo,
      percent: percentOf(t.kcal, obiettivo)
    },
    proteine: {
      value: t.proteine,
      target: targetProt,
      percent: percentOf(t.proteine, targetProt)
    },
    carboidrati: {
      value: t.carboidrati,
      target: targetCarbs,
      percent: percentOf(t.carboidrati, targetCarbs)
    },
    grassi: {
      value: t.grassi,
      target: targetFats,
      percent: percentOf(t.grassi, targetFats)
    }
  }
})
</script>

<template>
  <section class="macro-summary">
    <div class="macro-card kcal">
      <div class="macro-card-label">ENERGIA</div>
      <div class="macro-card-value tabular">
        {{ formatKcal(macros.kcal.value)
        }}<span class="macro-card-unit">kcal</span>
      </div>
      <div class="macro-progress">
        <div
          class="macro-progress-fill fill-green"
          :style="{ width: macros.kcal.percent + '%' }"
        />
      </div>
    </div>

    <div class="macro-card">
      <div class="macro-card-label">PROTEINE</div>
      <div class="macro-card-value tabular">
        {{ round0(macros.proteine.value) }}<span class="macro-card-unit">g</span>
      </div>
      <div class="macro-progress">
        <div
          class="macro-progress-fill fill-red"
          :style="{ width: macros.proteine.percent + '%' }"
        />
      </div>
    </div>

    <div class="macro-card">
      <div class="macro-card-label">CARBOIDRATI</div>
      <div class="macro-card-value tabular">
        {{ round0(macros.carboidrati.value) }}<span class="macro-card-unit">g</span>
      </div>
      <div class="macro-progress">
        <div
          class="macro-progress-fill fill-amber"
          :style="{ width: macros.carboidrati.percent + '%' }"
        />
      </div>
    </div>

    <div class="macro-card">
      <div class="macro-card-label">GRASSI</div>
      <div class="macro-card-value tabular">
        {{ round0(macros.grassi.value) }}<span class="macro-card-unit">g</span>
      </div>
      <div class="macro-progress">
        <div
          class="macro-progress-fill fill-blue"
          :style="{ width: macros.grassi.percent + '%' }"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.macro-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.macro-card {
  background: var(--gray-50);
  border: 1px solid #ebebeb;
  border-radius: var(--radius-md);
  padding: 12px 14px;
}

.macro-card-label {
  font-size: 10px;
  color: var(--gray-500);
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.macro-card-value {
  font-size: 20px;
  font-weight: 500;
  color: var(--gray-900);
  line-height: 1;
}

.macro-card-unit {
  font-size: 11px;
  color: var(--gray-500);
  margin-left: 2px;
}

.macro-card.kcal .macro-card-value {
  color: var(--green-800);
}

.macro-progress {
  margin-top: 8px;
  height: 3px;
  border-radius: 2px;
  background: #e8e8e4;
  overflow: hidden;
}

.macro-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.fill-green { background: var(--green-600); }
.fill-amber { background: var(--amber); }
.fill-blue  { background: var(--blue); }
.fill-red   { background: var(--red); }

@media (max-width: 720px) {
  .macro-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
  .macro-card {
    padding: 10px 12px;
  }
  .macro-card-value {
    font-size: 18px;
  }
}
</style>
