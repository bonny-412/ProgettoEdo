<script setup lang="ts">
/**
 * DayView — area centrale: macro summary + lista pasti del giorno selezionato.
 * - Su schermi molto larghi, il contenuto si centra entro una larghezza
 *   massima leggibile (1100 px) per evitare righe troppo lunghe.
 * - Su mobile, padding ridotto e card più compatte.
 */
import { useWeekPlan } from '@/composables/useWeekPlan'
import MacroSummary from './MacroSummary.vue'
import MealCard from './MealCard.vue'

const plan = useWeekPlan()

function onAddMeal(): void {
  plan.addMeal(plan.selectedDayKey.value, 'Nuovo pasto', 'altro')
}
</script>

<template>
  <section class="content">
    <div class="content-inner">
      <h2 class="day-title">{{ plan.currentDay.value.label }}</h2>

      <MacroSummary />

      <div class="meal-section">
        <MealCard
          v-for="meal in plan.currentDay.value.meals"
          :key="meal.uid"
          :day-key="plan.selectedDayKey.value"
          :meal="meal"
        />

        <v-btn class="app-btn app-btn--add-meal" size="large" variant="flat" @click="onAddMeal">
          + Aggiungi pasto (es. merenda, spuntino…)
        </v-btn>
      </div>
    </div>
  </section>
</template>

<style scoped>
.content {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  background: white;
}

.content-inner {
  max-width: 95%;
  margin: 0 auto;
  padding: 22px 28px calc(32px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.day-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--gray-900);
  margin: 0;
}

.meal-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (max-width: 900px) {
  .content-inner {
    padding: 16px 14px calc(24px + env(safe-area-inset-bottom, 0px));
  }
}

@media (max-width: 600px) {
  .content-inner {
    padding: 12px 10px calc(20px + env(safe-area-inset-bottom, 0px));
    gap: 12px;
  }
  .day-title {
    font-size: 16px;
  }
}

@media (min-width: 1800px) {
  .content-inner {
    max-width: 1280px;
    padding: 28px 40px 40px;
  }
}

</style>
