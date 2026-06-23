# Cinova — Documentazione architetturale

> **Leggere prima di qualsiasi modifica. Aggiornare dopo ogni modifica rilevante.**

---

## Stack tecnologico

| Layer | Tecnologia |
|---|---|
| Framework UI | Vue 3 (Options API) |
| State management | Pinia |
| Router | Vue Router 4 |
| Stili | SCSS (Dart Sass), scoped per componente |
| Backend / Auth | Supabase |
| API dati | TMDB (The Movie Database) v3 |
| Build tool | Vite |
| Icone | Font Awesome 6 Free (CDN) |

---

## Struttura directory

```
myflix/
├── public/
│   └── img/logo-myflix.png          ← logo (percorso: /img/logo-myflix.png, NON /public/img/)
├── router/
│   └── index.js                     ← rotte + scrollBehavior
├── src/
│   ├── assets/scss/
│   │   ├── main.scss                ← import globali + @keyframes spin
│   │   └── partials/
│   │       ├── variables.scss       ← design token (colori, spaziature, breakpoint)
│   │       └── mixins.scss          ← card-grid, hero-buttons, spinner, filter-chips
│   ├── components/                  ← tutti i componenti Vue
│   ├── constants/
│   │   └── genres.js
│   ├── services/
│   │   ├── tmdb.js                  ← wrapper Axios per TMDB
│   │   └── supabase.js              ← client Supabase
│   ├── stores/                      ← Pinia stores
│   ├── utils/
│   │   ├── debounce.js
│   │   ├── images.js
│   │   ├── media.js                 ← hasRequiredData()
│   │   └── password.js              ← isEmailValid(), validatori password
│   ├── App.vue                      ← shell: header fisso, router-view, bottom-nav
│   └── main.js
└── CLAUDE.md                        ← questo file
```

---

## Rotte

| Path | Componente | Note |
|---|---|---|
| `/` | `AppMain.vue` | Homepage con hero e carousel |
| `/search` | `SearchPage.vue` | Ricerca titoli e attori |
| `/film` | `Film.vue` | Wrapper di `BrowseGrid` (mediaType="movie") |
| `/series` | `Series.vue` | Wrapper di `BrowseGrid` (mediaType="tv") |
| `/my-list` | `MyList.vue` | Preferiti (requiresAuth) |
| `/person/:id` | `PersonDetail.vue` | Dettaglio attore + filmografia |
| `/account` | `AccountPage.vue` | Profilo utente |
| `/reset-password` | `ResetPasswordPage.vue` | meta.bare=true → niente header/nav |

`scrollBehavior` → `{ top: 0, left: 0, behavior: 'instant' }` su ogni navigazione.

---

## Componenti principali

### Layout
- **`App.vue`** — shell con `<AppHeader>` (position: fixed), `<router-view>`, `<BottomNav>` (mobile), `<ScrollToTop>`. Le rotte con `meta.bare = true` nascondono header e nav.
- **`AppHeader.vue`** — barra desktop con logo, nav, search bar (form + `SearchModeToggle` + dropdown suggerimenti cast), ProfileMenu. Su mobile nasconde nav e search (`display: none`); la ricerca è in `SearchPage`.
- **`BottomNav.vue`** — navigazione mobile fissa in basso.

### Ricerca
- **`SearchPage.vue`** — pagina di ricerca (visibile su mobile come pagina, su desktop integrata nell'header). Contiene il form mobile, il `SearchModeToggle`, il dropdown suggerimenti cast (flusso normale, non assoluto). Gestisce il debounce (300ms) sul testo.
- **`SearchModeToggle.vue`** — toggle Titolo/Cast, icone sole (no testo). Sincronizzato via store. Usato in `AppHeader` (desktop) e `SearchPage` (mobile).
- **`SearchFilters.vue`** — filtri avanzati (genere, ordinamento, provider). Usato in SearchPage, BrowseGrid, MyList, PersonDetail.

### Browsing
- **`BrowseGrid.vue`** — griglia unificata Film/Serie. Props: `mediaType: 'movie'|'tv'`, `title: String`. Gestisce cinema, provider, sort. `Film.vue` e `Series.vue` sono semplici wrapper.
- **`MovieCard.vue`** — card poster con overlay (anno, rating, badge tipo).
- **`DetailModal.vue`** — modale dettaglio titolo. Cast cliccabile → `PersonDetail`.

### Attori
- **`PersonDetail.vue`** — pagina `/person/:id`. Layout: `person-hero` (flex-row: foto sinistra + info+bio destra) → filmografia con filtri. La biografia è in `person-info` con `flex: 1`. **Usare `<div>` NON `<header>` per il pannello hero** (il tag `<header>` eredita `position: fixed` dal CSS globale).

### Auth
- **`AuthModal.vue`** — login/registrazione. Email duplicata → errore generico (non rivelare se l'email esiste).
- **`ResetPasswordModal.vue`**, **`ResetPasswordPage.vue`**.

### Preferiti
- **`MyList.vue`** — lista preferiti con filtri tipo/genere/provider/sort. `filteredItemsBase` (senza typeFilter) usato per i contatori chip.

---

## Pinia Stores

### `search.js`
Stato centrale della ricerca.

| State | Tipo | Descrizione |
|---|---|---|
| `text` | String | Testo cercato |
| `movies` / `series` | Array | Risultati (vuoti in cast mode) |
| `filter` | `'all'|'movie'|'tv'` | Chip tipo attivo |
| `searchMode` | `'title'|'cast'` | Modalità ricerca |
| `personSuggestions` | Array | Suggerimenti attori (cast mode) |
| `genres` / `sortBy` / `sortOrder` / `providers` | vari | Filtri attivi |
| `genresList` / `providersList` | Array | Lookup list (lazy fetch) |

**Azioni chiave:**
- `run()` — in cast mode chiama `fetchSuggestions()` e azzera movies/series; in title mode esegue ricerca TMDB.
- `fetchSuggestions()` — cerca attori per nome (≥2 char), max 8, solo con `profile_path`.
- `clearSuggestions()` — svuota `personSuggestions`.
- `setSearchMode(value)` — cambia modalità e pulisce i dati dell'altra.
- `fetchGenres()` / `fetchProviders()` — lazy, si fermano se già caricati.

**Getters:** `isCastMode`, `hasResults`, `visibleMovies`, `visibleSeries`, `hasCinema`, `realProviderIds`.

### `auth.js`
- `signUp()` — rileva email duplicata (status 422 o `identities: []`) e lancia errore con `code: 'DUPLICATE_EMAIL'`. Messaggio generico, niente info di sicurezza.

### `favorites.js`
Gestione preferiti Supabase.

### `albums.js`
Gestione album personalizzati.

---

## Servizi TMDB (`src/services/tmdb.js`)

Istanza Axios con `language: 'it-IT'`, `region: 'IT'`.

| Funzione | Endpoint |
|---|---|
| `searchMovies(query)` | `/search/movie` |
| `searchTv(query)` | `/search/tv` |
| `searchPerson(query)` | `/search/person` |
| `getDetails(id, mediaType)` | `/{mediaType}/{id}?append_to_response=credits` |
| `getPersonDetails(personId)` | `/person/{id}` — biografia solo in it-IT |
| `getPersonCredits(personId)` | `/person/{id}/combined_credits` |
| `getWatchProviders(id, mediaType)` | `/{mediaType}/{id}/watch/providers` → risultati IT |
| `getWatchProvidersList(mediaType)` | `/watch/providers/{mediaType}?watch_region=IT` |
| `getGenres(mediaType)` | `/genre/{mediaType}/list` |
| `discoverMovies(params)` | `/discover/movie` |
| `discoverTv(params)` | `/discover/tv` |

---

## Design token (`variables.scss`)

```scss
// Colori
$color-bg: #1c1c1c;
$color-surface: #232323;
$color-accent: #db1927;          // rosso MyFlix
$color-text: #ffffff;
$color-text-muted: #dcdcdc;
$color-text-dim: #dadada;

// Spaziature
$space-xs: 4px;  $space-sm: 8px;  $space-md: 16px;
$space-lg: 24px; $space-xl: 40px;

// Radii
$radius-sm: 5px;  $radius-md: 10px;

// Z-index
$z-header: 100;  $z-modal: 1000;  $z-auth: 2000;

// Layout
$header-height: 10vh;

// Breakpoint
$bp-md: 768px;   $bp-lg: 992px;
```

**Mixins disponibili:** `card-grid`, `hero-buttons($padding, $font-size, $gap)`, `spinner($size)`, `filter-chips`.
Import nei componenti: `@use '../assets/scss/partials/variables' as *;` e/o `@use '../assets/scss/partials/mixins' as *;`

---

## Pattern e convenzioni

### Debounce ricerca
`src/utils/debounce.js` — 300ms. Usato in `SearchPage` con watcher su `search.text`.

### Click-outside dropdown
`AppHeader` e `SearchPage` registrano `document.addEventListener('click', this.onOutside)` in `mounted` e lo rimuovono in `beforeUnmount`.
- AppHeader: skippa l'esecuzione se `.desktop-search` è `display: none` (mobile).
- SearchPage: usa `mobileSearchWrapper` ref.

### Dropdown cast su mobile vs desktop
- **Desktop** → dropdown in `AppHeader`, `position: absolute` dentro `.search-wrapper`.
- **Mobile** → dropdown in `SearchPage`, in flusso normale (no `position: absolute`), `margin-top: 8px` sotto il toggle.
- Il dropdown di AppHeader è `display: none` via media query `@media (max-width: $bp-lg)` per evitare artefatti visivi (wrapper collassato con suggestions attive).

### Provider / batch fetch
Caricamento lazy a batch di 5 chiamate parallele con `getWatchProviders`. Usato in `MyList`, `PersonDetail` e nel filtro provider della ricerca.

### BrowseGrid
Componente unificato per Film e Serie. `Film.vue` e `Series.vue` sono semplici wrapper:
```vue
<BrowseGrid media-type="movie" title="Film" />
```

### Immagini TMDB
- Poster/backdrop: `https://image.tmdb.org/t/p/w500{path}`
- Avatar attori: `https://image.tmdb.org/t/p/w185{path}`
- Profilo personDetail: `https://image.tmdb.org/t/p/w300{path}`

### Asset statici
File in `public/` vanno referenziati come `/nomefile` (es. `/img/logo-myflix.png`), **mai** come `/public/img/...`.

---

## Vincoli di sicurezza

- **Email duplicata**: non rivelare mai all'utente che l'email è già presente in Supabase. Usare sempre messaggio generico: *"Registrazione non riuscita. Verifica i dati inseriti e riprova."*
- **Git**: non eseguire mai commit o push automaticamente. Mostrare sempre le modifiche e attendere istruzione esplicita.

---

## Gotcha noti

| Problema | Causa | Fix |
|---|---|---|
| `<header>` eredita `position: fixed` | CSS globale in App.vue applica `header { position: fixed }` | Usare `<div>` per contenitori hero nelle pagine |
| Logo 404 | Vite serve `public/` dalla root | Percorso `/img/logo-myflix.png`, non `/public/img/...` |
| Dropdown AppHeader visibile su mobile | `v-if` condivide lo store, wrapper collassato → artefatto visivo | `.suggestions-dropdown { display: none }` nel media query `$bp-lg` di AppHeader |
| `onOutside` AppHeader interferisce su mobile | `searchWrapper` (desktop, nascosto) non contiene elementi mobile → `clearSuggestions()` su ogni tap | Skippa se `.desktop-search` è `display: none` |
| Bio Supabase email duplicata (locale) | `identities: []` oppure status 422 a seconda della config email confirmation | Auth store gestisce entrambi i casi |
