// E2E test för formulär
import { test, expect, type Page } from "@playwright/test";

test.describe("Login-formulär", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Arrange - Gå till login-sidan före varje formulärtest
    await page.goto("/");
  });

  test("ska visa formulärfält", async ({ page }: { page: Page }) => {
    // Assert - Kontrollera att alla nödvändiga login-element finns på sidan
    await expect(page.getByPlaceholder(/email/i)).toBeVisible(); // Email-input ska synas
    await expect(page.getByPlaceholder(/lösenord|password/i)).toBeVisible(); // Lösenord-input ska synas
    await expect(page.getByRole("button", { name: /logga in/i })).toBeVisible(); // Login-knapp ska synas
  });

  test("ska kunna fylla i email", async ({ page }: { page: Page }) => {
    // Arrange - Hitta email-inputfältet
    const emailInput = page.getByPlaceholder(/email/i);

    // Act - Skriv in en test-email
    await emailInput.fill("test@example.com");

    // Assert - Kontrollera att email:en sparades i fältet
    await expect(emailInput).toHaveValue("test@example.com"); // Värdet ska finnas kvar
  });

  test("ska kunna fylla i lösenord", async ({ page }: { page: Page }) => {
    // Arrange - Hitta lösenord-inputfältet
    const passwordInput = page.getByPlaceholder(/lösenord|password/i);

    // Act - Skriv in ett test-lösenord
    await passwordInput.fill("password123");

    // Assert - Kontrollera att lösenordet sparades i fältet
    await expect(passwordInput).toHaveValue("password123"); // Värdet ska finnas kvar
  });
});

test.describe("Registreringsformulär", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Arrange - Navigera till registreringssidan före varje registreringstest
    await page.goto("/"); // Börja på login
    await page.getByText(/registrera/i).click(); // Klicka för att gå till registrering
  });

  test("ska visa registreringsformulär", async ({ page }: { page: Page }) => {
    // Assert - Kontrollera att vi är på registreringssidan och formulär finns
    await expect(page).toHaveURL(/register/); // URL ska innehålla "register"
    await expect(page.getByPlaceholder(/email/i)).toBeVisible(); // Email-fält ska finnas på registreringssidan också
  });

  test("ska kunna fylla i email", async ({ page }: { page: Page }) => {
    // Arrange - Hitta email-inputfältet på registreringssidan
    const emailInput = page.getByPlaceholder(/email/i);

    // Act - Skriv in en ny användares email
    await emailInput.fill("newuser@example.com");

    // Assert - Kontrollera att email:en sparades korrekt
    await expect(emailInput).toHaveValue("newuser@example.com"); // Ny användares email ska finnas kvar
  });
});

test.describe("Formulärvalidering", () => {
  test("ska förhindra tom inloggning", async ({ page }: { page: Page }) => {
    // Arrange - Gå till login-sidan
    await page.goto("/");

    // Act - Försök logga in utan att fylla i några fält (testar validering)
    await page.getByRole("button", { name: /logga in/i }).click();

    // Assert - Användaren ska förbli på login-sidan (inloggning blockerad)
    await expect(page).toHaveURL("/"); // Ingen redirect ska ske vid tom inloggning
  });

  test("ska hantera ogiltigt email", async ({ page }: { page: Page }) => {
    // Arrange - Gå till login-sidan och hitta input-fälten
    await page.goto("/");
    const emailInput = page.getByPlaceholder(/email/i);

    // Act - Försök logga in med ogiltigt email-format
    await emailInput.fill("inte-en-email"); // Detta är INTE en giltig email
    await page.getByRole("button", { name: /logga in/i }).click();

    // Assert - Inloggning ska misslyckas och användaren ska stanna kvar
    await expect(page).toHaveURL("/"); // Ingen redirect ska ske vid ogiltigt email
  });
});
