# CI/CD Dokumentation

## Vad är CI/CD

Automatisk testning och deployment när man pushar kod till GitHub.

## Vad vi gjorde

Setup av pipeline som:
1. Lintar koden
2. Bygger projektet  
3. Deployer till GitHub Pages

## Filer

`.github/workflows/deploy.yml` - workflow config
`vite.config.ts` - måste ha base: '/StudentCommonSpace/' för GitHub Pages

## Secrets

GitHub Secrets (Settings -> Secrets and variables -> Actions):
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Användning

```bash
git add .
git commit -m "nåt"
git push
```

Kolla status: https://github.com/gowran1337/StudentCommonSpace/actions
Live: https://gowran1337.github.io/StudentCommonSpace/

## Git Branching Strategy

Vi jobbar med **feature branches** som mergas till `main` via Pull Requests.

### Workflow steg-för-steg:

**1. Skapa en feature branch**
```bash
git checkout -b feat/valfri-namn
```

**2. Koda din feature**
- Jobba i din branch som vanligt
- Gör commits löpande

**3. När du är klar — synka med main**
```bash
git stash                    # Spara dina ändringar tillfälligt
git checkout main            # Byt till main
git pull                     # Hämta senaste från GitHub
git checkout feat/valfri-namn # Byt tillbaka till din branch
git stash pop                # Lägg tillbaka dina ändringar
```

**4. Stage, commit och push**
```bash
git add .                    # Stagea dina filer
git commit -m "feat: beskrivning av vad du gjort"
git push origin feat/valfri-namn
```

**5. Skapa Pull Request på GitHub**
- Gå till GitHub → din branch → "Create Pull Request"
- Skriv en beskrivning av vad du gjort
- Sätt en reviewer från gruppen
- Skicka PR-länken till din reviewer

**6. Review och merge**
- Reviewern kollar igenom koden
- När hen godkänner (👍) → merga till main
- CI/CD körs automatiskt efter merge

### Branch-namngivning

| Prefix | Användning | Exempel |
|--------|-----------|---------|
| `feat/` | Ny funktionalitet | `feat/chat-system` |
| `fix/` | Buggfix | `fix/login-error` |
| `docs/` | Dokumentation | `docs/readme-update` |

### Visuellt flöde

```
main ────────────────────────────── (alltid stabil)
  \                        ↑
   feat/chat ──── PR ──── merge
  \                        ↑
   feat/expenses ── PR ── merge
```

## Problem

**Lint/build failar:** Kör `npm run lint` eller `npm run build` lokalt, fixa fel, pusha igen

**Merge-konflikter:** Synka med main oftare (steg 3 ovan)


## Viktigt

COMMITTA ALDRIG .env FILEN