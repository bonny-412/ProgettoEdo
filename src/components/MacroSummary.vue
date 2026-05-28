<script setup lang="ts">
import { computed } from 'vue'
import { useWeekPlan } from '@/composables/useWeekPlan'
import { formatKcal, percentOf, round0, round1, extendedForFood } from '@/utils/nutrition'

const plan = useWeekPlan()

const macros = computed(() => {
  const t = plan.dailyTotals.value
  const obiettivo = plan.patient.value.obiettivoKcal || 0

  const targetProt  = (obiettivo * 0.25) / 4
  const targetCarbs = (obiettivo * 0.5)  / 4
  const targetFats  = (obiettivo * 0.25) / 9

  return {
    kcal:        { value: t.kcal,        target: obiettivo,    percent: percentOf(t.kcal,        obiettivo)    },
    proteine:    { value: t.proteine,    target: targetProt,   percent: percentOf(t.proteine,    targetProt)   },
    carboidrati: { value: t.carboidrati, target: targetCarbs,  percent: percentOf(t.carboidrati, targetCarbs)  },
    grassi:      { value: t.grassi,      target: targetFats,   percent: percentOf(t.grassi,      targetFats)   }
  }
})

const extra = computed(() => {
  let zuccheri = 0, fibra = 0, ferro = 0, calcio = 0
  let hasZuccheri = false, hasFibra = false, hasFerro = false, hasCalcio = false

  for (const meal of plan.currentDay.value.meals) {
    for (const food of meal.alimenti) {
      const e = extendedForFood(food)
      if (e.zuccheri != null) { zuccheri += e.zuccheri; hasZuccheri = true }
      if (e.fibra    != null) { fibra    += e.fibra;    hasFibra    = true }
      if (e.ferro    != null) { ferro    += e.ferro;    hasFerro    = true }
      if (e.calcio   != null) { calcio   += e.calcio;   hasCalcio   = true }
    }
  }

  const targetFibra = 25
  return {
    zuccheri: { value: hasZuccheri ? zuccheri : null },
    fibra:    { value: hasFibra    ? fibra    : null, percent: hasFibra ? percentOf(fibra, targetFibra) : 0 },
    ferro:    { value: hasFerro    ? ferro    : null },
    calcio:   { value: hasCalcio   ? calcio   : null }
  }
})
</script>

<template>
  <section class="macro-summary">
    <div class="macro-card kcal">
      <div class="macro-card-label">ENERGIA</div>
      <div class="macro-card-value tabular">
        {{ formatKcal(macros.kcal.value) }}<span class="macro-card-unit">kcal</span>
      </div>
      <div class="macro-progress">
        <div class="macro-progress-fill fill-green" :style="{ width: macros.kcal.percent + '%' }" />
      </div>
    </div>

    <div class="macro-card">
      <div class="macro-card-label">PROTEINE</div>
      <div class="macro-card-value tabular">
        {{ round0(macros.proteine.value) }}<span class="macro-card-unit">g</span>
      </div>
      <div class="macro-progress">
        <div class="macro-progress-fill fill-red" :style="{ width: macros.proteine.percent + '%' }" />
      </div>
    </div>

    <div class="macro-card">
      <div class="macro-card-label">CARBOIDRATI</div>
      <div class="macro-card-value tabular">
        {{ round0(macros.carboidrati.value) }}<span class="macro-card-unit">g</span>
      </div>
      <div class="macro-progress">
        <div class="macro-progress-fill fill-amber" :style="{ width: macros.carboidrati.percent + '%' }" />
      </div>
    </div>

    <div class="macro-card">
      <div class="macro-card-label">GRASSI</div>
      <div class="macro-card-value tabular">
        {{ round0(macros.grassi.value) }}<span class="macro-card-unit">g</span>
      </div>
      <div class="macro-progress">
        <div class="macro-progress-fill fill-blue" :style="{ width: macros.grassi.percent + '%' }" />
      </div>
    </div>

    <div class="macro-card macro-card--sm">
      <div class="macro-card-label">ZUCCHERI</div>
      <div class="macro-card-value macro-card-value--sm tabular">
        <template v-if="extra.zuccheri.value != null">
          {{ round1(extra.zuccheri.value) }}<span class="macro-card-unit">g</span>
        </template>
        <span v-else class="macro-card-na">—</span>
      </div>
    </div>

    <div class="macro-card macro-card--sm">
      <div class="macro-card-label">FIBRA</div>
      <div class="macro-card-value macro-card-value--sm tabular">
        <template v-if="extra.fibra.value != null">
          {{ round1(extra.fibra.value) }}<span class="macro-card-unit">g</span>
        </template>
        <span v-else class="macro-card-na">—</span>
      </div>
      <div v-if="extra.fibra.value != null" class="macro-progress">
        <div class="macro-progress-fill fill-teal" :style="{ width: extra.fibra.percent + '%' }" />
      </div>
    </div>

    <div class="macro-card macro-card--sm">
      <div class="macro-card-label">FERRO</div>
      <div class="macro-card-value macro-card-value--sm tabular">
        <template v-if="extra.ferro.value != null">
          {{ round1(extra.ferro.value) }}<span class="macro-card-unit">mg</span>
        </template>
        <span v-else class="macro-card-na">—</span>
      </div>
    </div>

    <div class="macro-card macro-card--sm">
      <div class="macro-card-label">CALCIO</div>
      <div class="macro-card-value macro-card-value--sm tabular">
        <template v-if="extra.calcio.value != null">
          {{ round0(extra.calcio.value) }}<span class="macro-card-unit">mg</span>
        </template>
        <span v-else class="macro-card-na">—</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.macro-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.macro-card {
  background: var(--gray-50);
  border: 1px solid #ebebeb;
  border-radius: var(--radius-md);
  padding: 12px 14px;
}

.macro-card--sm {
  padding: 9px 12px;
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

.macro-card-value--sm {
  font-size: 16px;
}

.macro-card-unit {
  font-size: 11px;
  color: var(--gray-500);
  margin-left: 2px;
}

.macro-card-na {
  font-size: 14px;
  color: var(--gray-300);
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
.fill-teal  { background: #0d9488; }

@media (max-width: 720px) {
  .macro-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
  .macro-card { padding: 10px 12px; }
  .macro-card--sm { padding: 8px 10px; }
  .macro-card-value { font-size: 18px; }
  .macro-card-value--sm { font-size: 15px; }
}
</style>
