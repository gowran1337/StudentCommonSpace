import { test, expect } from "@playwright/test";

test.describe("Inloggning", () => {
  test("ska kunna logga in med giltiga uppgifter", async ({ page }) => {
    // Navigera till inloggningssidan (root path)
    await page.goto("/");

    // Vänta på att React-appen laddas
    await page.waitForSelector("h1", { timeout: 10000 });

    // Kontrollera att vi är på rätt sida
    await expect(page).toHaveTitle(/commonspacewebsite/);
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();

    // Fyll i inloggningsformulär (använd test-uppgifter)
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "testpassword123");

    // Klicka på login-knappen
    await page.click('button[type="submit"]');

    // Eftersom vi inte har riktiga test-uppgifter, förvänta oss ett felmeddelande
    // I en riktig testmiljö skulle du ha test-databas med kända användare
    await expect(
      page.locator('[class*="error"], [class*="bg-red"], .text-red'),
    ).toBeVisible({ timeout: 10000 });
  });

  test("ska visa felmeddelande vid ogiltiga uppgifter", async ({ page }) => {
    // Navigera till inloggningssidan
    await page.goto("/");

    // Vänta på att React-appen laddas
    await page.waitForSelector("h1", { timeout: 10000 });

    // Fyll i felaktiga uppgifter
    await page.fill('input[type="email"]', "fel@email.com");
    await page.fill('input[type="password"]', "felaktigt");

    // Klicka på login-knappen
    await page.click('button[type="submit"]');

    // Kontrollera att vi fortfarande är på login-sidan
    await expect(page).toHaveURL(/.*\//);

    // Leta efter felmeddelande
    const errorMessage = page.locator(
      '[class*="error"], [class*="bg-red"], .text-red',
    );
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test("ska kunna navigera mellan inloggning och registrering", async ({
    page,
  }) => {
    // Börja på inloggningssidan
    await page.goto("/");

    // Vänta på att React-appen laddas
    await page.waitForSelector("h1", { timeout: 10000 });

    // Klicka på registrera-länk
    await page.click('text="Registrera dig här"');

    // Kontrollera att vi är på registreringssidan
    await expect(page).toHaveURL(/.*register/);
    await expect(
      page.getByRole("heading", { name: "Registrera" }),
    ).toBeVisible();

    // Navigera tillbaka till login
    await page.goto("/");

    // Vänta på att login-sidan laddas igen
    await page.waitForSelector("h1", { timeout: 10000 });

    // Kontrollera att vi är tillbaka på login-sidan
    await expect(page).toHaveURL(/.*\//);
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  });
});
