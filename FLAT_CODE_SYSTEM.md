# Flat Code System – StudentCommonSpace

**Datum:** 2026-02-13  
**Version:** 1.0  
**Scope:** Frontend (React/TypeScript) + Supabase (Auth, Database, RLS)

---

## Syfte

Detta dokument beskriver hur `flat_code` används som tenant-nyckel i StudentCommonSpace för att separera data mellan olika lägenheter.

Målet är att göra det tydligt:
- var `flat_code` kommer från,
- hur det används i frontend,
- varför localStorage **inte** är säkerhetskällan,
- hur databasen (RLS) är den faktiska säkerhetsgränsen.

---

## Kort sammanfattning

- Varje användare tillhör en lägenhet (`flat_code`).
- Frontend läser och cachar `flat_code` för snabb UX.
- API-anrop filtrerar data med `flat_code`.
- Supabase RLS avgör slutgiltigt vilken data som får läsas/skrivas.
- Om localStorage manipuleras ska RLS ändå blockera obehörig åtkomst.

---

## Arkitekturflöde

1. Användaren loggar in via Supabase Auth.
2. Appen hämtar profil från tabellen `profiles` och läser användarens `flat_code`.
3. `flat_code` sparas i React-state och cachas i localStorage (`flatCode`).
4. Service-lagret använder `flatCode` för queries och cache keys.
5. Databasen tillämpar RLS policies för att verifiera att användaren endast når sin egen lägenhets data.

---

## Källor i kodbasen

### 1) Auth/Session och synk av `flat_code`

I `AuthContext`:
- Vid session restore läses `flatCode` från localStorage för snabb rendering.
- Därefter hämtas `flat_code` från `profiles` och synkar state/localStorage.
- Vid signout rensas `flatCode`.

Praktisk konsekvens:
- UI kan visa data snabbt,
- men den långsiktigt korrekta källan är databasen.

### 2) Service-lager och cache

I `src/services/api.ts`:
- `getUserFlatCode()` hämtar `flatCode` från localStorage.
- Läsningar filtrerar normalt med `.eq('flat_code', flatCode)`.
- Skapande av nya poster sätter `flat_code` på insert.
- Cache keys namespacas som `cache:<flatCode>:<resource>`.

Praktisk konsekvens:
- Lägenheter får separata cache-utrymmen i klienten,
- och data läcker inte mellan flats via cache när `flatCode` hanteras korrekt.

### 3) Databas och RLS (säkerhetsgräns)

RLS i Supabase/PostgreSQL måste vara aktiverat på alla tenant-tabeller. Policies ska utgå från inloggad användare (`auth.uid()`) och koppla till användarens `flat_code` i profiltabellen.

Det betyder att:
- frontend-filter är ett UX/prestandalager,
- RLS är det som faktiskt stoppar cross-flat access.

---

## Säkerhetsprinciper

### Principle 1: Never trust localStorage

`localStorage.flatCode` är manipulerbart i DevTools och får aldrig behandlas som auktoritativ säkerhetskälla.

### Principle 2: RLS is mandatory

Alla tabeller med tenant-data måste ha:
- `flat_code` kolumn,
- RLS aktiverat,
- policies som begränsar `SELECT/INSERT/UPDATE/DELETE` till användarens flat.

### Principle 3: Keep profile as source of truth

Kopplingen `user_id -> flat_code` ska ligga i databasens profilmodell. Frontend får cachea men ska alltid kunna synka om.

---

## Rekommenderad checklista vid nya features

När en ny tabell/API-feature läggs till:

1. Lägg till `flat_code` i tabellen.
2. Aktivera RLS.
3. Skapa policies för alla operationer (minst SELECT + INSERT + UPDATE + DELETE där relevant).
4. Säkerställ att create-flöden sätter `flat_code`.
5. Filtrera läsningar per `flat_code` i service-lagret.
6. Namespac:a cache keys med `flat_code`.
7. Verifiera med två testanvändare i olika flats.

---

## Vanliga fel att undvika

- Ny tabell utan RLS.
- Insert utan `flat_code`.
- Query utan tenant-filter i frontend (ger fel UX även om RLS skyddar).
- Delade cache keys utan `flat_code`-namespace.
- Antagande att localStorage-värde är “sant”.

---

## Verifiering (manuell)

Snabb smoke-check:

1. Logga in som användare A (flat X) och skapa data.
2. Logga in som användare B (flat Y).
3. Verifiera att data från X inte syns i Y.
4. Manipulera `localStorage.flatCode` i DevTools för B.
5. Verifiera att obehörig data fortfarande inte returneras från backend.

---

## Relaterade dokument

- `SECURITY_ANALYSIS.md` – övergripande hotmodell och riskbedömning.
- `CI-CD-DOKUMENTATION.md` – pipeline, deployment och branch-strategi.
