# MyFlix

Costruito con Vue 3 e Vite, che sfrutta le API di TMDB per mostrare film e serie TV. Supporta autenticazione utente via Supabase, preferiti persistenti per-utente e un'interfaccia responsive ispirata a Netflix.

---

## Stack tecnologico

| Livello | Tecnologia |
|---|---|
| Framework | Vue 3 (Options API + Composition API ibrido) |
| Build tool | Vite |
| State management | Pinia |
| Routing | Vue Router 4 |
| Backend/Auth | Supabase (PostgreSQL + Auth) |
| API dati | TMDB (The Movie Database) |
| HTTP client | Axios |
| Carousel | vue-awesome-swiper |
| Stili | SCSS con design token |
| Icone | Font Awesome 6 |

---

## Avvio del progetto

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Build di produzione
npm run build

# Anteprima build
npm run preview
```

---

## Variabili d'ambiente

Crea un file `.env` nella root del progetto (vedi `.env.example`):

```env
VITE_TMDB_API_KEY=la_tua_chiave_tmdb

# Opzionali — necessari solo se si usa Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=la_tua_anon_key
```

Se le variabili Supabase sono assenti, l'app funziona ugualmente: i preferiti vengono salvati in `localStorage` (nessun account, nessuna persistenza tra dispositivi).

> **Nota sicurezza**: non committare mai il file `.env`. La chiave TMDB è già in `.gitignore`. Se la chiave è finita nella git history, rigenerala dal pannello TMDB.

---

## Struttura del progetto

```
myflix/
├── public/
├── src/
│   ├── assets/
│   │   └── scss/
│   │       ├── main.scss
│   │       └── partials/
│   │           ├── variables.scss   # Design token (colori, spaziature, breakpoint)
│   │           ├── mixins.scss
│   │           └── reset.scss
│   ├── components/
│   │   ├── AppHeader.vue            # Navbar desktop con ricerca e ProfileMenu
│   │   ├── AppMain.vue              # Container home + risultati di ricerca
│   │   ├── AuthModal.vue            # Modale login / registrazione / recupero password
│   │   ├── BottomNav.vue            # Navigazione mobile con ricerca slide-up
│   │   ├── DetailModal.vue          # Modale dettaglio film/serie
│   │   ├── EmptyState.vue           # Stato vuoto riutilizzabile
│   │   ├── Film.vue                 # Pagina film popolari con paginazione
│   │   ├── Homepage.vue             # Hero Billboard + carousel per genere
│   │   ├── LoadingSkeleton.vue      # Skeleton loader per griglia card
│   │   ├── MovieCard.vue            # Card film/serie (poster + overlay + modali)
│   │   ├── MyList.vue               # Pagina preferiti utente
│   │   ├── PageLoader.vue           # Loader animato tra cambio route
│   │   ├── Pagination.vue           # Controlli pagina precedente/successiva
│   │   ├── PasswordInput.vue        # Input password con eye icon toggle
│   │   ├── PasswordStrength.vue     # Barra forza password + checklist regole
│   │   ├── ProfileMenu.vue          # Menu profilo (avatar, cambio password, logout)
│   │   ├── ResetPasswordModal.vue   # Overlay reset password (sicurezza cross-tab)
│   │   ├── ResetPasswordPage.vue    # Pagina standalone reset password (route bare)
│   │   ├── ScrollToTop.vue          # Pulsante scroll-to-top
│   │   ├── Series.vue               # Pagina serie TV popolari con paginazione
│   │   └── TrailerModal.vue         # Modale player trailer YouTube
│   ├── constants/
│   │   └── genres.js                # Mappa nome genere → ID TMDB
│   ├── router/
│   │   └── index.js                 # Definizione route Vue Router
│   ├── services/
│   │   ├── supabase.js              # Client Supabase + flag isSupabaseConfigured
│   │   └── tmdb.js                  # Tutte le chiamate API TMDB centralizzate
│   ├── stores/
│   │   ├── auth.js                  # Store autenticazione Supabase
│   │   ├── favorites.js             # Store preferiti (Supabase o localStorage)
│   │   └── search.js                # Store ricerca con filtri Film/Serie
│   ├── utils/
│   │   ├── images.js                # Costruzione URL immagini TMDB con fallback
│   │   └── password.js              # Regole validazione password + helper
│   ├── App.vue                      # Root component con layout condizionale
│   └── main.js                      # Entry point (Vue + Pinia + Router)
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## Routing

| Path | Componente | Note |
|---|---|---|
| `/` | `AppMain` (tramite `Homepage`) | Home con hero e caroselli |
| `/film` | `Film` | Film popolari con paginazione |
| `/series` | `Series` | Serie TV con paginazione |
| `/my-list` | `MyList` | Preferiti (login wall se non autenticati) |
| `/reset-password` | `ResetPasswordPage` | Pagina bare per reset password da email |

Le route con `meta: { bare: true }` non mostrano header, BottomNav e ScrollToTop. Usate per `/reset-password` per bloccare l'accesso all'app finché la password non è reimpostata.

---

## Store Pinia

### `auth.js`
Gestisce l'autenticazione Supabase.

**State**: `user`, `session`, `ready`, `avatarUrl`, `isRecovering`

**Getters**: `isLoggedIn`, `email`, `avatarKey`

**Actions**:
- `init()` — avvia la sessione, registra `onAuthStateChange`, intercetta `PASSWORD_RECOVERY`
- `signUp(email, password)` — registrazione
- `signIn(email, password)` — login + merge preferiti locali → Supabase
- `signOut()` — logout + pulizia stato
- `resetPassword(email)` — invia email di recupero con redirect a `/reset-password`
- `completePasswordReset(newPassword)` — aggiorna la password dopo recovery, chiude la modale
- `changePassword(newPassword)` — cambio password da profilo (utente già loggato)
- `setAvatar(dataUrl)` / `removeAvatar()` — avatar in `localStorage` per-utente

Il flag `isRecovering` viene persistito anche in `sessionStorage` (`myflix:recovery`) per sopravvivere a refresh di pagina durante il flusso di reset.

---

### `favorites.js`
Gestisce la lista preferiti. Se Supabase è configurato e l'utente è loggato, usa il DB; altrimenti usa `localStorage`.

**Normalizzazione**: tutti gli item vengono salvati nella forma `{ tmdb_id, media_type, title, poster_path, overview }` indipendentemente dalla sorgente (risultato TMDB grezzo o item già normalizzato da Supabase).

**Actions principali**:
- `load()` — carica i preferiti (Supabase o localStorage)
- `add(item, mediaType)` / `remove(tmdbId, mediaType)`
- `toggle(item, mediaType)` — aggiunge o rimuove
- `isFavorite(tmdbId, mediaType)` — getter booleano
- `mergeLocalIntoRemote()` — al login, i preferiti salvati in localStorage vengono migrati su Supabase

---

### `search.js`
Gestisce la ricerca full-text e i filtri.

**State**: `text`, `movies`, `series`, `filter` (`'all'` | `'movie'` | `'tv'`), `loading`

**Getters**: `visibleMovies`, `visibleSeries`, `totalCount`, `hasResults`

**Actions**:
- `run()` — esegue ricerca parallela su film e serie tramite TMDB
- `setFilter(value)` — imposta il filtro attivo

---

## Servizi

### `src/services/tmdb.js`
Istanza Axios centralizzata con `baseURL`, `api_key`, `language: 'it-IT'` e fallback `en-US` per i trailer.

Funzioni esportate:
- `searchMovies(query)` / `searchTv(query)`
- `getNowPlaying()` / `getTopRated()` / `getPopularMovies(page)` / `getPopularTv(page)`
- `getDiscoverByGenre(genreId, page)`
- `getTrailerUrl(id, mediaType)` — cerca prima in italiano, poi in inglese
- `getDetails(id, mediaType)` — dettagli completi (usati in DetailModal)

### `src/services/supabase.js`
Crea il client Supabase dalle variabili d'ambiente. Esporta `supabase` e `isSupabaseConfigured` (booleano — `false` se le env mancano, attiva la modalità degradata localStorage).

---

## Componenti principali

### `MovieCard.vue`
Card riutilizzabile per film e serie. Accetta sia oggetti grezzi TMDB sia preferiti normalizzati.

Props:
- `item` — oggetto film/serie
- `mediaType` — `'movie'` | `'tv'`
- `showTypeBadge` — mostra badge colorato Film/Serie (usato nei risultati di ricerca)

Comportamento:
- **Desktop** (`hover: hover`): overlay nascosto, compare al passaggio del mouse con poster che zooma
- **Mobile** (`hover: none`): overlay sempre visibile con solo il titolo; i pulsanti play/preferiti sono nascosti
- Click sul poster → apre `DetailModal`
- Pulsante play → recupera trailer e apre `TrailerModal`
- Pulsante ✓/+ → toggle preferiti

### `Homepage.vue`
Hero Billboard con film casuale dai "Now Playing" + 9 carousel Swiper per categoria (Novità, Top Rated, Popolari, Horror, Romantici, Azione, Fantascienza, Commedia, Documentari).

Breakpoint Swiper: 3 → 4 → 5 → 6 → 7 slide per vista.

### `AppMain.vue`
Ospita `Homepage` e sovrappone i risultati di ricerca quando `search.text` non è vuoto. I risultati includono chip filtro (Tutti / Film / Serie TV) e sezioni separate con badge colorati.

### `AuthModal.vue`
Tre modalità: `login` | `signup` | `reset`.
- Login: email + password, link "Hai dimenticato la password?"
- Signup: email + password con `PasswordStrength` + conferma password
- Reset: solo email, invia link di recupero

### `ResetPasswordPage.vue`
Pagina standalone (layout bare) raggiungibile via link email. Mostra:
1. Spinner durante `!auth.ready`
2. Form nuova password (con `PasswordStrength`) se `auth.isRecovering`
3. Messaggio errore "link non valido" altrimenti
4. Messaggio successo con redirect automatico alla home dopo 2.2s

### `ProfileMenu.vue`
Menu dropdown nell'header desktop.
- **Non loggato**: pulsanti "Registrati" e "Accedi" separati
- **Loggato**: sezione credenziali (email), gestione avatar (upload/rimozione immagine), cambio password, logout

### `BottomNav.vue`
Navigazione mobile. Il pulsante cerca apre un pannello slide-up con campo di ricerca e autofocus. La digitazione aggiorna `search.text`; il watcher in `App.vue` gestisce la navigazione e l'esecuzione della ricerca.

### `PageLoader.vue`
Loader animato (pallina rossa rimbalzante) che appare tra i cambi di route. Attivato da `router.beforeEach` con ritardo di 80ms (evita il flash su navigazioni rapide) e disattivato da `router.afterEach`.

---

## Utilità

### `src/utils/password.js`
Regole di validazione password:
- Almeno 8 caratteri
- Almeno una lettera maiuscola
- Almeno una lettera minuscola
- Almeno 2 numeri
- Almeno un carattere speciale

Funzioni: `isPasswordValid(password)`, `passwordStrength(password)` (0-5), `evaluateRules(password)`.

### `src/utils/images.js`
`getImageUrl(path, size)` — costruisce l'URL completo dell'immagine TMDB (es. `https://image.tmdb.org/t/p/w500/...`). Restituisce un placeholder se `path` è nullo.

### `src/constants/genres.js`
Mappa nomi genere → ID TMDB: `horror` (27), `romance` (10749), `action` (28), `sciFi` (878), `comedy` (35), `documentary` (99).

---

## Design token SCSS

Definiti in `src/assets/scss/partials/variables.scss`:

```scss
// Colori
$color-bg: #1C1C1C;
$color-surface: #2a2a2a;
$color-accent: #DB1927;
$color-text: #ffffff;
$color-text-muted: rgba(255,255,255,0.7);
$color-text-dim: rgba(255,255,255,0.4);

// Spaziature
$space-sm / $space-md / $space-lg / $space-xl

// Bordi
$radius-sm / $radius-md

// Breakpoint
$bp-sm / $bp-md / $bp-lg / $bp-xl
```

---

## Database Supabase

### Schema tabella `favorites`

```sql
create table public.favorites (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users (id) on delete cascade,
  tmdb_id       bigint not null,
  media_type    text not null check (media_type in ('movie','tv')),
  title         text,
  poster_path   text,
  overview      text,
  created_at    timestamptz default now(),
  unique (user_id, tmdb_id, media_type)
);
```

### Row Level Security

```sql
alter table public.favorites enable row level security;

create policy "own favorites - select"
  on public.favorites for select using (auth.uid() = user_id);

create policy "own favorites - insert"
  on public.favorites for insert with check (auth.uid() = user_id);

create policy "own favorites - delete"
  on public.favorites for delete using (auth.uid() = user_id);
```

Ogni utente può leggere, inserire e cancellare solo i propri preferiti.

---

## Flussi principali

### Registrazione e login
1. Utente apre `AuthModal` (da ProfileMenu o MyList login wall)
2. In modalità signup: inserisce email + password (validata con `PasswordStrength`)
3. Supabase invia email di conferma
4. Al login: `mergeLocalIntoRemote()` migra eventuali preferiti salvati anonimamente
5. `onAuthStateChange` aggiorna lo store; i preferiti vengono caricati da Supabase

### Recupero password
1. Utente clicca "Hai dimenticato la password?" in `AuthModal`
2. Inserisce email → `auth.resetPassword(email)` → Supabase invia email con link
3. Link punta a `[origin]/reset-password` (route con `meta: { bare: true }`)
4. Supabase redirige con token; `onAuthStateChange` intercetta `PASSWORD_RECOVERY`
5. `auth.isRecovering = true` + flag `sessionStorage` per resistere al refresh
6. `ResetPasswordPage` mostra il form; al submit chiama `auth.completePasswordReset()`
7. Flag rimosso, utente reindirizzato alla home

### Aggiunta preferiti
1. Utente clicca ✓/+ su `MovieCard` o in `DetailModal`
2. `favorites.toggle(item, mediaType)` normalizza l'item e chiama `add` o `remove`
3. Se loggato → INSERT/DELETE su Supabase; se anonimo → aggiornamento `localStorage`
4. `isFavorite()` è reattivo: l'UI si aggiorna istantaneamente

### Ricerca
1. Utente digita nella search bar (desktop in header, mobile in BottomNav)
2. `search.text` si aggiorna; il watcher in `App.vue` chiama `search.run()`
3. Se non si è già sulla home, router naviga a `/`
4. `AppMain` mostra i risultati sovrapposti con chip filtro Tutti/Film/Serie TV
5. `MovieCard` in modalità ricerca mostra badge colorato tipo (rosso Film, blu Serie)

---

## Note di sicurezza

- La chiave TMDB è letta esclusivamente da variabile d'ambiente `VITE_TMDB_API_KEY`
- Il file `.env` è in `.gitignore`
- Le policy RLS di Supabase garantiscono l'isolamento dei dati per utente
- La `anon key` Supabase è sicura lato client: le policy RLS impediscono accessi non autorizzati
- Il token di recovery viene gestito solo tramite `onAuthStateChange` e `sessionStorage` (mai esposto in URL visitabili)
- L'avatar è salvato in `localStorage` (base64) e non viene inviato a server esterni
