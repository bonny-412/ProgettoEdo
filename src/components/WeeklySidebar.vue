<script setup lang="ts">
/**
 * WeeklySidebar — elenco giorni della settimana con kcal e
 * "media settimanale" in fondo.
 *
 * - Desktop (>= 900px): colonna fissa a sinistra, sempre visibile.
 * - Mobile / tablet (< 900px): drawer a scomparsa da sinistra,
 *   controllato da useSidebar. Si chiude automaticamente alla selezione
 *   di un giorno o toccando il backdrop.
 */
import { useWeekPlan } from '@/composables/useWeekPlan'
import { useSidebar } from '@/composables/useSidebar'
import { formatKcal } from '@/utils/nutrition'
import type { DayKey } from '@/types'

const plan = useWeekPlan()
const { isSidebarOpen, closeSidebar } = useSidebar()

function select(day: DayKey): void {
  plan.selectDay(day)
  closeSidebar()   // su mobile chiude il drawer; su desktop non ha effetto visivo
}
</script>

<template>
  <!-- Backdrop: visibile solo su mobile quando il drawer è aperto -->
  <Transition name="fade">
    <div
      v-if="isSidebarOpen"
      class="sidebar-backdrop"
      aria-hidden="true"
      @click="closeSidebar"
    />
  </Transition>

  <aside class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
    <div class="sidebar-label">Settimana</div>

    <button
      v-for="day in plan.days.value"
      :key="day.key"
      type="button"
      class="day-row"
      :class="{ active: plan.selectedDayKey.value === day.key }"
      @click="select(day.key)"
    >
      <span class="day-name">{{ day.label }}</span>
      <span class="day-kcal tabular">
        {{ plan.kcalPerDay.value[day.key] > 0
          ? `${formatKcal(plan.kcalPerDay.value[day.key])} kcal`
          : '—'
        }}
      </span>
    </button>

    <div class="sidebar-total">
      <div class="sidebar-total-label">Media settimanale</div>
      <div class="sidebar-total-value tabular">
        {{ plan.activeDaysCount.value > 0
          ? `${formatKcal(plan.weeklyAverages.value.kcal)} kcal`
          : '—'
        }}
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* ── Stili base (desktop ≥ 900px) ──────────────────────────── */

.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  background: var(--gray-50);
  border-right: 1px solid #e8e8e4;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.sidebar-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--gray-500);
  padding: 4px 10px 8px;
  text-transform: uppercase;
}

.day-row {
  appearance: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'DM Sans', sans-serif;
  text-align: left;
  width: 100%;
  transition: background 0.12s ease;
}

.day-row:hover  { background: var(--gray-100); }
.day-row.active { background: var(--green-100); }

.day-name {
  font-size: 13px;
  color: var(--gray-700);
  font-weight: 400;
}

.day-row.active .day-name {
  color: var(--green-800);
  font-weight: 500;
}

.day-kcal {
  font-size: 10px;
  color: var(--gray-300);
}

.day-row.active .day-kcal { color: var(--green-600); }

.sidebar-total {
  margin-top: auto;
  padding: 12px 10px 4px;
  border-top: 1px solid #e8e8e4;
}

.sidebar-total-label {
  font-size: 10px;
  color: var(--gray-500);
  margin-bottom: 4px;
}

.sidebar-total-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--green-800);
}

/* ── Mobile / tablet (< 900px): drawer a scomparsa ─────────── */

.sidebar-backdrop {
  display: none; /* nascosto su desktop */
}

@media (max-width: 900px) {
  /* Backdrop semi-trasparente sotto il drawer */
  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    top: 56px; /* sotto la topbar */
    background: rgba(0, 0, 0, 0.38);
    z-index: 299;
  }

  /* Drawer fisso che scivola da sinistra */
  .sidebar {
    position: fixed;
    top: 56px; /* sotto la topbar */
    left: 0;
    bottom: 0;
    width: 260px;
    z-index: 300;
    transform: translateX(-100%);
    transition: transform 0.26s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.14);
    /* resetta flex al layout verticale */
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    border-right: 1px solid #e8e8e4;
    padding: 14px 10px;
    gap: 2px;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .day-row {
    width: 100%;
    flex-direction: row;
    min-width: unset;
  }
}

/* Transizione fade per il backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
