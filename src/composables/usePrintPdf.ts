import { DAY_KEYS, MEAL_TYPE_COLOR } from '@/data/defaults'
import type { DayPlan, Meal, NutritionTotals } from '@/types'
import { extendedForFood, round0, totalsForMeal, totalsForDay } from '@/utils/nutrition'
import { useWeekPlan } from './useWeekPlan'

function fmt(n: number, decimals = 1): string {
  return n.toLocaleString('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

function fmtKcal(n: number): string {
  return round0(n).toLocaleString('it-IT')
}

function fmtOpt(v: number | undefined, decimals = 1): string {
  if (v == null) return '<span style="color:#ccc">-</span>'
  return fmt(v, decimals)
}

function buildMealRows(meal: Meal): string {
  return meal.alimenti.map((food) => {
    const e = extendedForFood(food)
    return '<tr>' +
      '<td class="food-name">' + food.nome + '</td>' +
      '<td>' + round0(food.grammi) + '</td>' +
      '<td>' + fmtKcal(e.kcal) + '</td>' +
      '<td>' + fmt(e.proteine) + '</td>' +
      '<td>' + fmt(e.grassi) + '</td>' +
      '<td>' + fmt(e.carboidrati) + '</td>' +
      '<td>' + fmtOpt(e.zuccheri) + '</td>' +
      '<td>' + fmtOpt(e.fibra) + '</td>' +
      '<td>' + fmtOpt(e.ferro) + ' <span class="unit-mg">mg</span></td>' +
      '<td>' + fmtOpt(e.calcio) + ' <span class="unit-mg">mg</span></td>' +
      '<td>' + fmtOpt(e.sodio) + ' <span class="unit-mg">mg</span></td>' +
      '</tr>'
  }).join('')
}

function buildMealBlock(meal: Meal): string {
  const totals = totalsForMeal(meal)
  const color = MEAL_TYPE_COLOR[meal.tipo] || '#6B6B6B'
  const noteHtml = meal.nota && meal.nota.trim()
    ? '<div class="meal-note"><span class="note-lbl">Nota:</span> ' + meal.nota.trim() + '</div>'
    : ''

  return '<div class="meal-block">' +
    '<div class="meal-header">' +
      '<div class="meal-left">' +
        '<span class="meal-dot" style="background:' + color + '"></span>' +
        '<span class="meal-name">' + meal.nome + '</span>' +
      '</div>' +
      '<span class="meal-kcal">' + fmtKcal(totals.kcal) + ' kcal</span>' +
    '</div>' +
    '<table class="food-table">' +
      '<thead><tr>' +
        '<th class="col-name">Alimento</th>' +
        '<th>g</th>' +
        '<th>Kcal</th>' +
        '<th>Prot. (g)</th>' +
        '<th>Grassi (g)</th>' +
        '<th>Carb. (g)</th>' +
        '<th>Zucc. (g)</th>' +
        '<th>Fibra (g)</th>' +
        '<th>Ferro</th>' +
        '<th>Calcio</th>' +
        '<th>Sodio</th>' +
      '</tr></thead>' +
      '<tbody>' + buildMealRows(meal) + '</tbody>' +
    '</table>' +
    '<div class="meal-totals">' +
      '<span class="mt-item"><span class="mt-lbl">Proteine</span> ' + fmt(totals.proteine) + ' g</span>' +
      '<span class="mt-item"><span class="mt-lbl">Carboidrati</span> ' + fmt(totals.carboidrati) + ' g</span>' +
      '<span class="mt-item"><span class="mt-lbl">Grassi</span> ' + fmt(totals.grassi) + ' g</span>' +
    '</div>' +
    noteHtml +
  '</div>'
}

function buildDaySection(day: DayPlan): string {
  const activeMeals = day.meals.filter((m) => m.alimenti.length > 0)
  if (activeMeals.length === 0) return ''

  const totals: NutritionTotals = totalsForDay({ ...day, meals: activeMeals })
  const mealsHtml = activeMeals.map(buildMealBlock).join('')

  return '<div class="day-section">' +
    '<div class="day-header">' +
      '<span class="day-name">' + day.label + '</span>' +
      '<span class="day-kcal-total">' + fmtKcal(totals.kcal) + ' kcal totali</span>' +
    '</div>' +
    '<div class="day-body">' +
      mealsHtml +
      '<div class="day-total">' +
        '<span class="day-total-lbl">Totale giornaliero</span>' +
        '<span class="dt-item"><span class="dt-lbl">Kcal</span><strong>' + fmtKcal(totals.kcal) + '</strong></span>' +
        '<span class="dt-item"><span class="dt-lbl">Proteine</span><strong>' + fmt(totals.proteine) + ' g</strong></span>' +
        '<span class="dt-item"><span class="dt-lbl">Carboidrati</span><strong>' + fmt(totals.carboidrati) + ' g</strong></span>' +
        '<span class="dt-item"><span class="dt-lbl">Grassi</span><strong>' + fmt(totals.grassi) + ' g</strong></span>' +
      '</div>' +
    '</div>' +
  '</div>'
}

const PDF_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; color: #1a1a1a; background: white; }
  .pdf-header { background: #2E7D32; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; }
  .pdf-brand { display: flex; align-items: center; gap: 10px; }
  .pdf-logo { width: 40px; height: 40px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
  .pdf-logo img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .brand-name { color: white; font-size: 16px; font-weight: 600; }
  .brand-role { color: rgba(255,255,255,0.55); font-size: 9px; letter-spacing: 0.1em; }
  .doc-title { color: white; font-size: 12px; font-weight: 500; text-align: right; }
  .doc-date  { color: rgba(255,255,255,0.55); font-size: 9px; text-align: right; margin-top: 2px; }
  .pdf-patient { background: #F0FAF1; border-bottom: 1px solid #D8F3DC; padding: 9px 24px; display: flex; gap: 32px; }
  .pf { display: flex; flex-direction: column; gap: 1px; }
  .pf-lbl { font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #4a9e62; }
  .pf-val { font-size: 12px; font-weight: 500; color: #1a2e22; }
  .pdf-body { padding: 0 24px 24px; }
  .day-section { margin-top: 18px; }
  .day-header { background: #2E7D32; border-radius: 5px 5px 0 0; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; page-break-after: avoid; break-after: avoid; }
  .day-name { color: white; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; }
  .day-kcal-total { color: rgba(255,255,255,0.75); font-size: 10px; }
  .day-body { border: 0.5px solid #d4d4d0; border-top: none; border-radius: 0 0 5px 5px; overflow: hidden; }
  .meal-block { border-top: 0.5px solid #ebebea; }
  .meal-block:first-child { border-top: none; }
  .meal-header { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px 5px; background: #fafaf9; border-bottom: 0.5px solid #f0f0ee; }
  .meal-left { display: flex; align-items: center; gap: 7px; }
  .meal-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
  .meal-name { font-size: 10px; font-weight: 600; color: #1a1a1a; }
  .meal-kcal { font-size: 10px; color: #555; }
  .food-table { width: 100%; border-collapse: collapse; font-size: 10px; }
  .food-table thead { background: #f5f5f3; }
  .food-table th { padding: 4px 6px; text-align: right; font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #555; border-bottom: 0.5px solid #e8e8e6; }
  .food-table th.col-name { text-align: left; }
  .food-table td { padding: 4px 6px; text-align: right; color: #333; border-bottom: 0.5px solid #f2f2f0; }
  .food-table td.food-name { text-align: left; color: #1a1a1a; }
  .food-table tr:last-child td { border-bottom: none; }
  .unit-mg { font-size: 8px; color: #666; }
  .meal-totals { display: flex; justify-content: flex-end; gap: 14px; padding: 4px 12px 5px; background: #fafaf9; border-top: 0.5px solid #f0f0ee; font-size: 9px; }
  .mt-item { display: flex; gap: 3px; }
  .mt-lbl { color: #888; }
  .meal-note { padding: 3px 12px 5px; font-size: 9px; font-style: italic; color: #777; background: #fafaf9; border-top: 0.5px solid #f5f5f3; }
  .note-lbl { color: #aaa; font-style: normal; font-weight: 600; margin-right: 2px; }
  .day-total { display: flex; align-items: center; gap: 16px; padding: 7px 12px; background: #F0FAF1; border-top: 1px solid #D8F3DC; }
  .day-total-lbl { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: #3a7a56; margin-right: auto; }
  .dt-item { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
  .dt-lbl { font-size: 8px; color: #6b9e80; text-transform: uppercase; letter-spacing: 0.05em; }
  .dt-item strong { font-size: 12px; font-weight: 600; color: #2E7D32; }
  .pdf-footer { margin-top: 20px; padding: 8px 24px; border-top: 0.5px solid #e8e8e6; display: flex; justify-content: space-between; font-size: 8px; color: #777; }
  @media print { .meal-block { page-break-inside: avoid; } }
`

const PRINT_OVERRIDE_STYLES = `
  @media print {
    body > *:not(#__pdf_print_area__) { display: none !important; }
    #__pdf_print_area__ { display: block !important; }
  }
`

function buildDocument(
  patient: { nome: string; dataScheda: string; obiettivoKcal: number },
  days: DayPlan[]
): string {
  const activeDays = days.filter((d) => d.meals.some((m) => m.alimenti.length > 0))

  if (activeDays.length === 0) {
    return '<p style="padding:40px 24px;font-family:sans-serif;color:#666;">Nessun pasto con alimenti da stampare.</p>'
  }

  const daysHtml = activeDays.map(buildDaySection).join('')

  const dataFormattata = patient.dataScheda
    ? new Date(patient.dataScheda).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : patient.dataScheda

  const oggi = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return '<style>' + PDF_STYLES + '</style>' +
    '<div class="pdf-header">' +
      '<div class="pdf-brand">' +
        '<div class="pdf-logo"><img src="/logo-pdf.png" alt="Logo" /></div>' +
        '<div><div class="brand-name">Edoardo</div><div class="brand-role">DIETISTA</div></div>' +
      '</div>' +
      '<div>' +
        '<div class="doc-title">Piano alimentare settimanale</div>' +
        '<div class="doc-date">Generato il ' + oggi + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="pdf-patient">' +
      '<div class="pf"><span class="pf-lbl">Paziente</span><span class="pf-val">' + patient.nome + '</span></div>' +
      '<div class="pf"><span class="pf-lbl">Data scheda</span><span class="pf-val">' + dataFormattata + '</span></div>' +
      '<div class="pf"><span class="pf-lbl">Obiettivo calorico</span><span class="pf-val">' + round0(patient.obiettivoKcal).toLocaleString('it-IT') + ' kcal / giorno</span></div>' +
    '</div>' +
    '<div class="pdf-body">' + daysHtml + '</div>' +
    '<div class="pdf-footer">' +
      '<span>Edoardo - Dietista - Piano alimentare riservato</span>' +
      '<span>Documento generato automaticamente</span>' +
    '</div>'
}

export function usePrintPdf() {
  const plan = useWeekPlan()

  function printPdf(): void {
    const days = DAY_KEYS.map((k) => plan.weekPlan.value[k])
    const html = buildDocument(plan.patient.value, days)

    const container = document.createElement('div')
    container.id = '__pdf_print_area__'
    container.innerHTML = html
    container.style.cssText = 'display:none;position:absolute;top:0;left:0;width:100%;'
    document.body.appendChild(container)

    const overrideStyle = document.createElement('style')
    overrideStyle.id = '__pdf_print_override__'
    overrideStyle.textContent = PRINT_OVERRIDE_STYLES
    document.head.appendChild(overrideStyle)

    container.style.display = 'block'

    const originalTitle = document.title
    document.title = 'Piano alimentare - ' + plan.patient.value.nome

    const cleanup = () => {
      document.title = originalTitle
      container.remove()
      overrideStyle.remove()
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)

    window.print()
  }

  return { printPdf }
}
