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

## Problem

**Lint/build failar:** Kör `npm run lint` eller `npm run build` lokalt, fixa fel, pusha igen


## Viktigt

COMMITTA ALDRIG .env FILEN