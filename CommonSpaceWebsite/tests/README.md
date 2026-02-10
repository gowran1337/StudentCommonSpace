# Tester för StudentCommonSpace

Enkelt och rakt på sak! 🚀

## Struktur

```
tests/
├── *.test.ts      # Alla vanliga tester här
├── e2e/           # End-to-end tester (Playwright)
└── helpers.ts     # Hjälpfunktioner
```

## Kör tester

```bash
# Alla tester
npm test

# E2E-tester
npm run test:e2e
```

## Lägg till nya tester

1. Skapa en `.test.ts` fil i `tests/` mappen
2. Skriv dina tester med `describe` och `it` 
3. Kör `npm test` för att se att de fungerar

## Exempel

```typescript
describe('Min komponent', () => {
  it('ska göra något', () => {
    expect(true).toBe(true);
  });
});
```
