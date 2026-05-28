# Piano alimentare — Dott. Edoardo Dietista

Web app **Vue 3 + Vite + Vuetify + TypeScript** per la creazione e la stampa di piani alimentari settimanali in ambito professionale (dietistica).

> L'app è una **single page senza backend**: si inserisce il piano della settimana, si consulta, si stampa in PDF e si chiude. Niente server, niente database, niente autenticazione, niente persistenza tra sessioni.

---

## Indice

1. [Funzionalità](#funzionalità)
2. [Stack e dipendenze](#stack-e-dipendenze)
3. [Architettura](#architettura)
4. [Struttura del progetto](#struttura-del-progetto)
5. [Avvio rapido](#avvio-rapido)
6. [Componenti](#componenti)
7. [Gestione dello stato](#gestione-dello-stato)
8. [Database alimenti](#database-alimenti)
9. [Calcoli nutrizionali](#calcoli-nutrizionali)
10. [Stampa PDF](#stampa-pdf)
11. [Layout responsive](#layout-responsive)

---

## Funzionalità

### Piano settimanale
- 7 giorni (Lunedì → Domenica), navigabili dalla sidebar.
- Ogni giorno parte con 6 pasti predefiniti: Colazione, Spuntino mattina, Pranzo, Spuntino pomeriggio, Cena, Spuntino sera.
- Possibilità di aggiungere pasti extra per ogni giorno.
- Ogni pasto è modificabile (nome, tipologia) ed eliminabile con conferma.

### Alimenti
- **Ricerca dal database**: autocomplete con lazy loading sull'indice JSON (`foods-index.json`). Il dettaglio del singolo alimento viene caricato on-demand e tenuto in cache.
- **Alimento manuale**: dialog "Alimento personalizzato" per inserire nome, grammi e valori per 100 g (kcal, proteine, carboidrati, grassi).
- Modifica dei grammi direttamente in tabella; rimozione alimento con conferma.
- Nota libera testuale su ogni pasto.

### Macro e calorie
- Calcolo automatico di kcal, proteine, carboidrati e grassi per alimento, per pasto, per giorno e media settimanale.
- 4 card riepilogative in cima alla vista giornaliera con barre di avanzamento rispetto all'obiettivo del paziente.
- Sidebar con kcal giornaliere per ogni giorno e media settimanale (solo sui giorni con almeno un alimento).

### Dati paziente
- Nome, data scheda e obiettivo calorico giornaliero (kcal/giorno) configurabili dalla barra paziente.
- I dati restano in memoria per tutta la sessione e vengono usati nelle card macro e nel PDF.

### Stampa PDF
- Bottone **Stampa PDF** nella topbar (con testo su desktop, solo icona su mobile).
- Genera un documento HTML al volo, lo inietta nel DOM e chiama `window.print()`: zero librerie esterne, testo selezionabile nel PDF, qualità vettoriale.
- I pasti senza alimenti vengono omessi; i giorni completamente vuoti non appaiono nel documento.
- Dopo la stampa il DOM viene ripristinato automaticamente (evento `afterprint`).

---

## Stack e dipendenze

| Libreria | Versione | Ruolo |
|---|---|---|
| Vue | ^3.5 | Framework UI (Composition API + `<script setup>`) |
| Vite | ^5.4 | Build tool e dev server |
| TypeScript | ~5.6 | Type-safety su tutto il progetto |
| Vuetify | ^3.12 | Componenti UI (bottoni, dialog, autocomplete, date picker…) |
| @mdi/font | ^7.4 | Icone Material Design usate da Vuetify |
| vue-tsc | ^2.1 | Type-check dei file `.vue` |
| vite-plugin-vuetify | ^2.0 | Tree-shaking automatico di Vuetify |

Nessuna libreria per la gestione del PDF (uso nativo `window.print()`), nessuno store Pinia (stato gestito via composable singleton).

---

## Architettura

```
Browser
│
├── App.vue                    ← shell: layout a colonne (sidebar + content)
│   ├── AppHeader              ← topbar: brand, nuova scheda, stampa PDF
│   ├── PatientBar             ← dati paziente + dialog modifica
│   ├── WeeklySidebar          ← lista giorni + kcal + media settimanale
│   └── DayView                ← area centrale: macro + lista pasti
│       ├── MacroSummary       ← 4 card energia/proteine/carb/grassi
│       └── MealCard (×n)      ← singolo pasto
│           ├── FoodTable      ← tabella alimenti con edit grammi
│           ├── FoodSearchAutocomplete  ← ricerca + selezione alimento
│           └── CustomFoodDialog        ← inserimento alimento manuale
│
├── composables/
│   ├── useWeekPlan.ts         ← UNICO stato globale dell'app (singleton)
│   ├── usePrintPdf.ts         ← generazione HTML + stampa PDF
│   ├── useFoodSearch.ts       ← ricerca reattiva con loading/error
│   ├── useSidebar.ts          ← open/close del drawer mobile
│   └── useConfirm.ts          ← dialog di conferma generico
│
└── services/
    └── foodService.ts         ← fetch + caching indice e dettagli alimenti
```

### Flusso dati

Tutto lo stato modificabile vive in `useWeekPlan` come **singleton di modulo**: le `ref` sono dichiarate a livello di modulo (fuori dalla funzione esportata), quindi ogni componente che importa il composable legge e scrive sullo stesso oggetto reattivo. Non serve Pinia né `provide/inject`.

---

## Struttura del progetto

```
.
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
│
├── public/
│   ├── favicon.svg
│   ├── logo.svg
│   └── foods/
│       ├── foods-index.json     ← indice leggero (id, nome, categoria, file)
│       └── <id>.json            ← dettaglio alimento (formato BDA IEO)
│
└── src/
    ├── main.ts                  ← bootstrap Vue + Vuetify
    ├── App.vue                  ← shell dell'app
    ├── env.d.ts                 ← dichiarazioni ambiente Vite
    │
    ├── plugins/
    │   └── vuetify.ts           ← tema verde personalizzato + defaults componenti
    │
    ├── styles/
    │   └── main.css             ← variabili CSS globali, reset, classi utility
    │
    ├── types/
    │   └── index.ts             ← tutti i tipi TypeScript (Food, Meal, DayPlan…)
    │
    ├── data/
    │   └── defaults.ts          ← DAY_KEYS, DAY_LABELS, pasti default, colori pasto
    │
    ├── utils/
    │   ├── nutrition.ts         ← funzioni pure: calcoli macro, formattazione
    │   └── uid.ts               ← generatore di ID univoci locali
    │
    ├── services/
    │   └── foodService.ts       ← loadFoodIndex, loadFoodDetail, searchFoodIndex
    │
    ├── composables/
    │   ├── useWeekPlan.ts       ← stato globale: piano, paziente, azioni CRUD
    │   ├── usePrintPdf.ts       ← generazione documento PDF e window.print()
    │   ├── useFoodSearch.ts     ← ricerca reattiva alimenti (loading, error, results)
    │   ├── useSidebar.ts        ← controllo drawer mobile
    │   └── useConfirm.ts        ← dialog di conferma riutilizzabile
    │
    └── components/
        ├── AppHeader.vue              ← topbar con brand e pulsanti azione
        ├── PatientBar.vue             ← barra dati paziente + dialog modifica
        ├── WeeklySidebar.vue          ← sidebar giorni settimana + media kcal
        ├── DayView.vue                ← area contenuto del giorno selezionato
        ├── MacroSummary.vue           ← 4 card riepilogative macro giornalieri
        ├── MealCard.vue               ← card singolo pasto (header + tabella + nota)
        ├── FoodTable.vue              ← tabella alimenti con edit inline grammi
        ├── FoodSearchAutocomplete.vue ← autocomplete ricerca alimenti dal DB
        ├── CustomFoodDialog.vue       ← dialog inserimento alimento personalizzato
        ├── ConfirmDialog.vue          ← dialog conferma generica (elimina, reset…)
        └── WelcomeDialog.vue          ← dialog di benvenuto al primo avvio
```

---

## Avvio rapido

```bash
# Installazione dipendenze
npm install

# Avvio in sviluppo (http://localhost:5173)
npm run dev

# Type-check senza build
npm run type-check

# Build di produzione (type-check + bundle ottimizzato in dist/)
npm run build

# Anteprima della build
npm run preview
```

> La build di produzione è una cartella statica (`dist/`): può essere servita da qualsiasi web server, CDN o anche aperta direttamente come file locale, purché i file JSON in `public/foods/` siano raggiungibili.

---

## Componenti

### `AppHeader`
Topbar verde fissa in cima. Contiene il logo/brand, il bottone **Nuova scheda** (con dialog di conferma che resetta il piano) e il bottone **Stampa PDF**. Su mobile mostra solo le icone.

### `PatientBar`
Barra verde chiara sotto la topbar con nome paziente, data scheda e obiettivo calorico. Un bottone "Modifica" apre un dialog con campi editabili (nome, data tramite date picker, kcal con validazione numerica).

### `WeeklySidebar`
Colonna sinistra con i 7 giorni della settimana. Ogni riga mostra il nome del giorno e le kcal totali (o `—` se il giorno è vuoto). In fondo mostra la media settimanale calcolata solo sui giorni con almeno un alimento. Su desktop è fissa; su mobile è un drawer a scomparsa con backdrop e animazione slide.

### `DayView`
Area centrale che mostra il giorno selezionato. Contiene il titolo del giorno, il `MacroSummary` e la lista dei `MealCard`. In fondo un bottone "Aggiungi pasto" crea un pasto vuoto di tipo `altro`.

### `MacroSummary`
Griglia di 4 card (energia, proteine, carboidrati, grassi) con il valore del giorno corrente e una barra di avanzamento rispetto all'obiettivo. I target macro sono derivati dall'obiettivo kcal del paziente: 25% proteine, 50% carboidrati, 25% grassi (indicativi, non clinici).

### `MealCard`
Card di un singolo pasto. Header con nome, pallino colorato per tipologia e kcal totali del pasto. Menu contestuale per modificare nome/tipologia o eliminare il pasto. Corpo con `FoodTable`, riga di ricerca (`FoodSearchAutocomplete`) e campo nota libera.

### `FoodTable`
Tabella degli alimenti del pasto: nome, grammi (editabile inline), kcal, proteine, carboidrati, grassi. Pulsante rimozione su ogni riga.

### `FoodSearchAutocomplete`
Campo di ricerca con autocomplete. Al primo focus carica l'indice alimenti. La selezione di una voce carica on-demand il JSON di dettaglio e aggiunge l'alimento al pasto con grammi di default (100 g). Un bottone "manuale" apre il `CustomFoodDialog`.

### `CustomFoodDialog`
Dialog modale per inserire un alimento personalizzato: nome, grammi e valori nutrizionali per 100 g.

---

## Gestione dello stato

Tutto lo stato dell'app vive in `src/composables/useWeekPlan.ts` come **singleton di modulo**:

```
weekPlan      ref<WeekPlan>       — piano settimanale (7 DayPlan, ognuno con n Meal)
selectedDayKey  ref<DayKey>       — giorno visualizzato nell'area centrale
patient         ref<PatientInfo>  — nome, data scheda, obiettivo kcal
```

Le `ref` sono dichiarate **fuori** dalla funzione `useWeekPlan()`, a livello di modulo. Questo garantisce che tutti i componenti che importano il composable condividano la stessa istanza reattiva senza bisogno di `provide/inject` o di uno store Pinia.

### Azioni principali

| Funzione | Descrizione |
|---|---|
| `selectDay(key)` | Cambia il giorno visualizzato |
| `addMeal(dayKey, nome, tipo)` | Aggiunge un pasto al giorno |
| `removeMeal(dayKey, mealUid)` | Rimuove un pasto |
| `updateMeal(dayKey, mealUid, patch)` | Aggiorna nome/tipo/nota di un pasto |
| `addFood(dayKey, mealUid, food)` | Aggiunge un alimento a un pasto |
| `removeFood(dayKey, mealUid, foodUid)` | Rimuove un alimento |
| `updateFood(dayKey, mealUid, foodUid, patch)` | Aggiorna grammi o altri campi di un alimento |
| `updatePatient(patch)` | Aggiorna i dati del paziente |
| `resetAll()` | Riporta il piano ai valori predefiniti |

### Computed esposti

| Computed | Tipo | Descrizione |
|---|---|---|
| `days` | `DayPlan[]` | Array ordinato Lun → Dom |
| `currentDay` | `DayPlan` | Giorno attualmente selezionato |
| `dailyTotals` | `NutritionTotals` | Somma macro del giorno corrente |
| `kcalPerDay` | `Record<DayKey, number>` | Kcal per ogni giorno (per la sidebar) |
| `weeklyTotals` | `NutritionTotals` | Somma macro dell'intera settimana |
| `weeklyAverages` | `NutritionTotals` | Media macro sui giorni con almeno un alimento |
| `activeDaysCount` | `number` | Numero di giorni con almeno un alimento |

---

## Database alimenti

Gli alimenti sono file JSON statici in `public/foods/`, nel formato **BDA IEO** (Banca Dati di Composizione degli Alimenti — Istituto Europeo di Oncologia).

### Struttura dell'indice (`foods-index.json`)

```json
[
  { "id": 1095, "nome": "Pasta di semola", "categoria": "Cereali", "file": "1095.json" },
  ...
]
```

L'indice è leggero (solo id, nome, categoria e nome file) ed è caricato una sola volta al primo utilizzo della ricerca.

### Struttura del dettaglio (`<id>.json`)

```json
{
  "id": 1095,
  "nome": "Pasta di semola, cruda",
  "categoria": { "codice": 1, "nome": "Cereali e derivati" },
  "valori_per_100g": {
    "energia": { "kcal": 357, "kj": 1494 },
    "proteine_g": 12.8,
    "lipidi_g": 1.7,
    "carboidrati_g": 71.5,
    "fibra_g": 2.7,
    "acqua_g": 11.3
  }
}
```

I campi effettivamente usati dall'app sono `energia.kcal`, `proteine_g`, `lipidi_g` e `carboidrati_g`. Tutti gli altri campi (minerali, vitamine, ecc.) vengono ignorati.

### Aggiungere nuovi alimenti

1. Aggiungere una riga a `public/foods/foods-index.json` con un `id` univoco e il nome del file.
2. Creare il file `public/foods/<id>.json` seguendo la struttura sopra.
3. Non è necessario ricompilare l'app: i file vengono caricati a runtime.

### Caching e deduplicazione

`foodService.ts` gestisce tre livelli di cache:
- **Indice**: caricato una volta, tenuto in `indexPromise` (singleton).
- **Dettaglio**: ogni alimento caricato è salvato in una `Map<id, FoodDetail>`.
- **In-flight**: se due richieste per lo stesso alimento partono contemporaneamente, viene deduplicate con una seconda `Map<id, Promise>`.

---

## Calcoli nutrizionali

Tutti i calcoli sono funzioni pure in `src/utils/nutrition.ts`, senza dipendenze da Vue.

### Formula base

```
valore_finale = valore_per_100g × grammi / 100
```

Applicata a kcal, proteine, carboidrati e grassi per ogni alimento.

### Aggregazione

```
totale_pasto  = Σ macrosForFood(alimento)  per ogni alimento del pasto
totale_giorno = Σ totalsForMeal(pasto)      per ogni pasto del giorno
totale_sett.  = Σ totalsForDay(giorno)      per ogni giorno della settimana
media_sett.   = totale_settimana / giorni_attivi
```

Un giorno è considerato "attivo" se almeno un pasto ha almeno un alimento.

### Target macro nelle card (MacroSummary)

I target usati nelle barre di avanzamento sono calcolati dall'obiettivo kcal del paziente con la seguente suddivisione indicativa:

| Macro | % kcal | Fattore conversione |
|---|---|---|
| Proteine | 25% | ÷ 4 kcal/g |
| Carboidrati | 50% | ÷ 4 kcal/g |
| Grassi | 25% | ÷ 9 kcal/g |

Questi valori sono **indicatori visivi** e non costituiscono prescrizione clinica.

---

## Stampa PDF

La funzione di stampa è implementata in `src/composables/usePrintPdf.ts` senza librerie esterne.

### Approccio tecnico

1. Legge il piano da `useWeekPlan()`.
2. Filtra i pasti senza alimenti e i giorni completamente vuoti.
3. Costruisce una stringa HTML completa (header, barra paziente, sezioni giornaliere, footer) con CSS inline dedicato alla stampa.
4. Inietta un `<div id="__pdf_print_area__">` nel `<body>` con l'HTML generato.
5. Inietta un `<style id="__pdf_print_override__">` con la regola:
   ```css
   @media print {
     body > *:not(#__pdf_print_area__) { display: none !important; }
   }
   ```
   che nasconde l'intera applicazione durante la stampa, mostrando solo il documento.
6. Chiama `window.print()`: il browser apre il dialog nativo "Stampa / Salva come PDF".
7. Sull'evento `afterprint` rimuove il div e il tag style dal DOM, ripristinando l'app.

### Vantaggi rispetto alle alternative

| | `window.print()` | jsPDF + html2canvas | pdfmake |
|---|---|---|---|
| Dipendenze | zero | ~600 KB | ~1 MB |
| Testo selezionabile | ✅ | ❌ (immagine) | ✅ |
| Qualità | vettoriale | raster | vettoriale |
| Manutenzione layout | CSS standard | JS imperativo | JSON proprietario |

### Struttura del documento PDF

```
┌─────────────────────────────────────────┐
│  Header verde (brand + titolo + data)   │
├─────────────────────────────────────────┤
│  Barra paziente (nome, data, obiettivo) │
├─────────────────────────────────────────┤
│  [Per ogni giorno con almeno un pasto]  │
│  ┌─────────────────────────────────┐    │
│  │ Header giorno + kcal totali     │    │
│  │  [Per ogni pasto con alimenti]  │    │
│  │  ┌───────────────────────────┐  │    │
│  │  │ Nome pasto · kcal         │  │    │
│  │  │ Tabella alimenti          │  │    │
│  │  │ Totali macro pasto        │  │    │
│  │  │ Nota (se presente)        │  │    │
│  │  └───────────────────────────┘  │    │
│  │ Totale giornaliero              │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│  Footer (brand + nota riservatezza)     │
└─────────────────────────────────────────┘
```

---

## Layout responsive

| Breakpoint | Comportamento |
|---|---|
| ≥ 900 px | Sidebar fissa a sinistra, area contenuto a destra, macro su 4 colonne |
| 720–899 px | Sidebar diventa drawer (hamburger in topbar), macro su 4 colonne |
| 600–719 px | Macro su 2 colonne, padding ridotto |
| ≤ 380 px | Topbar compatta (brand centrato, solo icone per i bottoni azione), padding minimo |

La sidebar mobile si apre con un'animazione slide da sinistra e si chiude toccando il backdrop semitrasparente o selezionando un giorno.
