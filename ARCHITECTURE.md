# Arkitekturdokumentation – StudentCommonSpace

**Datum:** 2026-02-13  
**Version:** 1.0  
**Status:** Living document

---

## Innehållsförteckning

1. [Översikt](#översikt)
2. [Teknisk Stack](#teknisk-stack)
3. [Projektstruktur](#projektstruktur)
4. [Arkitektoniska Lager](#arkitektoniska-lager)
5. [Dataflöden](#dataflöden)
6. [Tekniska Val och Motiveringar](#tekniska-val-och-motiveringar)
7. [State Management](#state-management)
8. [Säkerhetsarkitektur](#säkerhetsarkitektur)
9. [Deployment och CI/CD](#deployment-och-ci-cd)
10. [Prestandaoptimering](#prestandaoptimering)

---

## Översikt

StudentCommonSpace är en Single Page Application (SPA) byggd med React och TypeScript, designad för att hjälpa studenter i en lägenhet att samordna städning, inköp, utgifter och kommunikation.

### Nyckelprinciper

- **Multi-tenant isolation:** Varje lägenhet är isolerad via `flat_code`
- **Offline-first caching:** Snabb UX med localStorage-cache
- **Security-by-default:** RLS på databas-nivå säkerställer dataisolering
- **Type-safety:** TypeScript genomgående för färre runtime-fel
- **Modern tooling:** Vite för snabb utveckling och optimerad produktion

---

## Teknisk Stack

### Frontend

| Teknologi | Version | Syfte |
|-----------|---------|-------|
| **React** | 19.2.0 | UI-ramverk med komponentbaserad arkitektur |
| **TypeScript** | 5.9.3 | Typsäkerhet och bättre developer experience |
| **React Router** | 7.12.0 | Client-side routing och navigation |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS för snabb styling |
| **Vite** | 7.2.4 | Build tool med HMR och optimerad bundling |

### Backend & Infrastruktur

| Teknologi | Syfte |
|-----------|-------|
| **Supabase** | Backend-as-a-Service (Auth, Database, Realtime) |
| **PostgreSQL** | Relationsdatabas med Row Level Security |
| **GitHub Pages** | Statisk webbhosting |
| **GitHub Actions** | CI/CD pipeline |

### Testing

| Teknologi | Syfte |
|-----------|-------|
| **Vitest** | Unit och integration testing |
| **Playwright** | End-to-end testing |
| **Testing Library** | React component testing |
| **ESLint** | Linting och kodkvalitet |

---

## Projektstruktur

```
CommonSpaceWebsite/
├── src/
│   ├── components/          # Återanvändbara UI-komponenter
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Toast.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── pages/               # Route-specifika sidor
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Calendar.tsx
│   │   ├── TaskBoard.tsx
│   │   ├── Expenses.tsx
│   │   ├── BulletinBoard.tsx
│   │   ├── GeneralChat.tsx
│   │   └── Profile.tsx
│   │
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx      # Autentisering och session
│   │   └── ThemeContext.tsx     # Tema (ljus/mörkt läge)
│   │
│   ├── services/            # API-kommunikation och business logic
│   │   └── api.ts               # CRUD för alla resurser
│   │
│   ├── utils/               # Hjälpfunktioner
│   │   ├── cache.ts             # localStorage cache management
│   │   └── validation.ts        # Input-validering
│   │
│   ├── lib/                 # Externa bibliotek-konfiguration
│   │   └── supabase.ts          # Supabase client setup
│   │
│   ├── hooks/               # Custom React hooks
│   │   └── useTheme.ts
│   │
│   ├── App.tsx              # Root komponent med routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles och Tailwind imports
│
├── public/
│   └── _headers             # Security headers för Cloudflare/Netlify
│
├── tests/                   # Test-filer
│   ├── e2e/                 # Playwright E2E-tester
│   └── *.test.ts            # Vitest unit-tester
│
├── supabase/                # Databas-migrations och SQL-scripts
│   ├── fix_profiles_rls.sql
│   └── theme_migration.sql
│
└── Konfigurationsfiler
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── eslint.config.js
    └── playwright.config.ts
```

---

## Arkitektoniska Lager

### 1. Presentation Layer (UI Components)

**Ansvar:**
- Rendera UI baserat på props och state
- Hantera användarinteraktioner
- Delegera business logic till contexts och services

**Principer:**
- Komponenter ska vara **dumma** eller **smarta**, inte båda
- Dumma komponenter: tar emot props, renderar, inga side effects
- Smarta komponenter: hämtar data, hanterar state, använder hooks

**Exempel:**
```tsx
// Dumb component
function TaskItem({ task, onToggle }) {
  return (
    <div onClick={() => onToggle(task.id)}>
      {task.text} - {task.assignee}
    </div>
  );
}

// Smart component
function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    cleaningTasksApi.getAll().then(setTasks);
  }, []);
  
  return tasks.map(task => <TaskItem key={task.id} task={task} />);
}
```

### 2. State Management Layer (Contexts)

**Ansvar:**
- Hantera global state (auth, tema)
- Tillhandahålla state och actions till komponenter
- Cache och synka state med backend

**Context Providers:**

#### AuthContext
- Hanterar user session och JWT-tokens
- Hämtar och cachar `flat_code`
- Exponerar `signIn()` och `signOut()`

#### ThemeContext
- Hanterar ljus/mörkt tema
- Persisteras i localStorage
- Applicerar tema-klasser på document

#### ToastProvider & ConfirmProvider
- UI-state för notifikationer och dialoger
- Imperativ API för att visa meddelanden

### 3. Service Layer (API)

**Ansvar:**
- Kommunicera med Supabase API
- Hantera CRUD-operationer
- Cache management och invalidering
- Error handling

**Struktur:**
```typescript
export const resourceApi = {
  getAll: async () => { /* hämta med cache */ },
  create: async (data) => { /* skapa och invalidera cache */ },
  update: async (id, data) => { /* uppdatera */ },
  delete: async (id) => { /* ta bort */ },
};
```

**Resurser:**
- `cleaningTasksApi` – städuppgifter
- `cleaningScheduleApi` – städschema
- `shoppingListApi` – inköpslista
- `bulletinPostItsApi` – lappar på anslagstavla
- `expensesApi` – utgifter
- `messagesApi` – chat-meddelanden

### 4. Data Layer (Supabase + Cache)

**Ansvar:**
- Persistent storage i PostgreSQL
- Row-Level Security (RLS)
- Realtime subscriptions
- localStorage cache för snabbare laddning

**Cache-strategi:**
```
1. Försök läsa från cache (TTL: 5 min)
2. Om miss eller expired → hämta från Supabase
3. Spara i cache med timestamp
4. Vid mutations (create/update/delete) → invalidera cache
```

---

## Dataflöden

### Inloggningsflöde

```
1. Användare → Login-formulär → AuthContext.signIn()
                                      ↓
2. Supabase Auth → JWT-token ← Session skapas
                                      ↓
3. AuthContext → Hämta user_id från JWT
                                      ↓
4. Supabase DB → SELECT flat_code FROM profiles WHERE id = user_id
                                      ↓
5. localStorage ← Cachea flat_code
                                      ↓
6. React Router → Redirect till /calendar
```

### Datahämtningsflöde (exempel: städuppgifter)

```
1. Component mount → useEffect() → cleaningTasksApi.getAll()
                                           ↓
2. Cache check → cacheGet('cache:FLAT123:cleaning_tasks')
                                           ↓
3a. Cache HIT → Return cached data → Render UI ✓
                                           
3b. Cache MISS → Supabase query
                 .from('cleaning_tasks')
                 .select('*')
                 .eq('flat_code', 'FLAT123')
                                           ↓
4. PostgreSQL RLS → Verifiera att user tillhör FLAT123
                                           ↓
5. Return data → cacheSet() → Render UI ✓
```

### Skapande av ny post (Create flow)

```
1. User → Fyll i formulär → Submit
                              ↓
2. Component → cleaningTasksApi.create({ text, assignee })
                              ↓
3. Service → Lägg till flat_code från localStorage
                              ↓
4. Supabase → INSERT INTO cleaning_tasks (text, assignee, flat_code)
                              ↓
5. RLS Policy → Verifiera att flat_code matchar user's profile
                              ↓
6. Success → cacheRemove('cache:FLAT123:cleaning_tasks')
                              ↓
7. Component → Re-fetch → Uppdaterad UI ✓
```

### Realtime-flöde (Bulletin Board)

```
1. Component mount → bulletinPostItsApi.subscribe(flatCode, callbacks)
                              ↓
2. Supabase Realtime → Lyssna på INSERT/UPDATE/DELETE i 'bulletin_postits'
                              ↓
3. Database event → Filtrera på flat_code (channel: bulletin_postits_FLAT123)
                              ↓
4. Callback triggas → onInsert(newPostIt)
                              ↓
5. React state uppdateras → UI re-renderas ✓
```

---

## Tekniska Val och Motiveringar

### Varför React?

**Pro:**
- Komponentbaserad arkitektur → återanvändbara UI-delar
- Stort ekosystem och community
- Välkänt av teamet

**Con:**
- Något större bundle size än mindre ramverk (men Vite + lazy loading hjälper)

### Varför TypeScript?

**Pro:**
- Typsäkerhet fångar buggar vid compile-time
- Bättre IDE-support (autocomplete, refactoring)
- Self-documenting code

**Con:**
- Initial learning curve
- Något mer verbose

**Beslut:** Typsäkerheten överväger kostnaden, särskilt i multi-developer team.

### Varför Supabase istället för egen backend?

**Pro:**
- Snabb setup utan server-konfiguration
- Inbyggd autentisering och RLS
- PostgreSQL → kraftfull SQL-databas
- Realtime utan extra infrastruktur
- Gratis tier tillräcklig för MVP

**Con:**
- Vendor lock-in
- Begränsad kontroll över infrastruktur

**Beslut:** För MVP är speed-to-market viktigare än full kontroll. Kan migreras senare om behov uppstår.

### Varför Vite istället för Create React App?

**Pro:**
- 10-100x snabbare development server (ESM-baserad)
- Snabbare builds
- Mindre bundle size med bättre tree-shaking
- CRA är deprecated

**Con:**
- Något yngre ekosystem

**Beslut:** Vite är den moderna standarden för React-projekt.

### Varför localStorage för cache?

**Pro:**
- Persistent mellan sessioner
- Enkelt API
- Inget extra beroende

**Con:**
- Begränsat till 5-10MB
- Synkront (kan blocka main thread vid stora operationer)

**Beslut:** Data-volymen är liten för vårt use case. Om det växer kan vi migrera till IndexedDB.

### Varför GitHub Pages istället för Vercel/Netlify?

**Pro:**
- Gratis
- Redan använder GitHub för version control
- Enkel integration med GitHub Actions

**Con:**
- Endast statiska sidor (men SPA fungerar med rätt config)
- Ingen server-side rendering

**Beslut:** SPA behöver ingen SSR, och kostnadsfrihet är viktigt för studentprojekt.

---

## State Management

### Global State (via Context)

**Hanteras av:**
- `AuthContext` → user, session, flatCode
- `ThemeContext` → theme (light/dark)

**Tillgänglig via:**
```tsx
const { user, flatCode, signOut } = useAuth();
const { theme, setTheme } = useTheme();
```

### Local State (useState)

Använd för:
- Formulär-input
- UI-state (modaler, dropdowns)
- Sida-specifik data

### Server State (via useEffect + api)

Pattern:
```tsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  resourceApi.getAll()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, [dependency]);
```

**Varför inte React Query / SWR?**

För MVP är förvaltningen enkel nog att hantera manuellt. Om komplexiteten ökar (många parallella requests, optimistiska uppdateringar) kan vi migrera.

---

## Säkerhetsarkitektur

### Defense in Depth

Säkerheten bygger på flera lager:

```
1. HTTPS (transport layer)
          ↓
2. JWT-validering (autentisering)
          ↓
3. Row Level Security (auktorisering på DB-nivå)
          ↓
4. Input validation (XSS/SQL-injection prevention)
          ↓
5. Security headers (X-Frame-Options, CSP)
```

### Autentisering

- **Metod:** Email/password via Supabase Auth
- **Token:** JWT med kort livslängd (1h)
- **Refresh:** Automatisk token refresh av Supabase SDK
- **Storage:** HttpOnly cookies (om konfigurerat) eller sessionStorage

### Auktorisering (Row Level Security)

Varje tabell med tenant-data har RLS policies:

```sql
-- Exempel: cleaning_tasks
CREATE POLICY "Users can only access their flat's tasks"
  ON cleaning_tasks
  FOR ALL
  USING (
    flat_code = (
      SELECT flat_code 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );
```

Detta betyder:
- Även om frontend skickar fel `flat_code` → RLS blockerar
- Ingen data läcker mellan lägenheter
- Säkerheten är på backend, inte frontend

### XSS-skydd

- React escapar automatiskt all output i JSX
- `dangerouslySetInnerHTML` används **inte**
- CSP headers begränsar script-sources (i produktion)

### CSRF-skydd

- Supabase JWT-tokens skickas som Bearer-token, inte cookies
- Same-Origin Policy blockerar cross-domain requests

**Se även:** `SECURITY_ANALYSIS.md` och `FLAT_CODE_SYSTEM.md`

---

## Deployment och CI/CD

### Pipeline (GitHub Actions)

```yaml
Trigger: Push to main
  ↓
1. Checkout code
  ↓
2. Install dependencies (npm ci)
  ↓
3. Run linter (npm run lint)
  ↓
4. Build production bundle (npm run build)
  ↓
5. Deploy to GitHub Pages
```

### Environment Variables

**Utveckling (`.env.local`):**
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

**Produktion (GitHub Secrets):**
- Konfigureras i GitHub repo settings
- Injectas av CI/CD pipeline vid build

### Deployment-flöde

```
Developer → git push origin main
                ↓
GitHub Actions → Build & Test
                ↓
Success → Deploy till gh-pages branch
                ↓
GitHub Pages → Serverar från gh-pages
                ↓
Live: https://gowran1337.github.io/StudentCommonSpace/
```

**Se även:** `CI-CD-DOKUMENTATION.md`

---

## Prestandaoptimering

### 1. Code Splitting

- React Router lazy-loading för routes
- Vite bygger chunks automatiskt

```tsx
const Calendar = lazy(() => import('./pages/Calendar'));
```

### 2. Cache-strategi

- localStorage cache med TTL (5 min)
- Namespace per `flat_code` för multi-tenant isolation
- Cache invalidation vid mutations

### 3. Optimistic UI Updates

I vissa komponenter (t.ex. checkbox-toggle) kan vi uppdatera UI direkt och synka i bakgrunden:

```tsx
const handleToggle = async (id) => {
  // Optimistic update
  setTasks(tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t));
  
  // Synk med backend
  try {
    await taskApi.update(id, { completed: !task.completed });
  } catch (err) {
    // Rollback vid fel
    setTasks(originalTasks);
  }
};
```

### 4. Realtime Batching

Realtime-uppdateringar debouncas för att undvika för många re-renders:

```tsx
const debouncedUpdate = useMemo(
  () => debounce((data) => setState(data), 300),
  []
);
```

### 5. Bundle Optimization

- **Tree shaking:** Vite tar bort oanvänd kod
- **Minification:** Terser minifierar JS
- **CSS purging:** Tailwind tar bort oanvända styles
- **Compression:** Gzip på server (GitHub Pages)

**Resultat:**
- Initial bundle: ~150KB (gzipped)
- First Contentful Paint: <1.5s (3G)

---

## Framtida Förbättringar

### Kortsiktigt
- [ ] Lägg till React Query för bättre server state management
- [ ] Implementera optimistic updates genomgående
- [ ] Service Worker för offline-support
- [ ] Komprimera bilder/assets automatiskt

### Långsiktigt
- [ ] Migrera från localStorage till IndexedDB för större dataset
- [ ] Server-side rendering (SSR) för bättre SEO och initial load
- [ ] E2E-tester för alla kritiska user flows
- [ ] Performance monitoring (Lighthouse CI)
- [ ] A/B-testning för UX-förbättringar

---

## Relaterad Dokumentation

- `SECURITY_ANALYSIS.md` – Säkerhetsrisker och mitigering
- `FLAT_CODE_SYSTEM.md` – Multi-tenant arkitektur
- `CI-CD-DOKUMENTATION.md` – Deployment och Git-workflow
- `tests/README.md` – Testing-strategi

---

