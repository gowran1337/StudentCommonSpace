// E2E test för autentisering och navigation
import { test, expect, type Page } from "@playwright/test";

test.describe("Autentisering", () => {
  test("ska visa login-formulär", async ({ page }: { page: Page }) => {
    // Arrange & Act - Navigera till startsidan där login-formuläret ska finnas
    await page.goto("/");

    // Assert - Kontrollera att vi är på rätt sida och att alla login-element finns
    await expect(page).toHaveURL("/"); // Bekräftar att vi är på startsidan
    await expect(page.getByPlaceholder(/email/i)).toBeVisible(); // Email-fältet måste synas
    await expect(page.getByPlaceholder(/lösenord|password/i)).toBeVisible(); // Lösenord-fältet måste synas
  });

  test("ska navigera till registrering", async ({ page }: { page: Page }) => {
    // Arrange - Börja på login-sidan
    await page.goto("/");

    // Act - Klicka på registrera-länken för att gå till registreringssidan
    await page.getByText(/registrera/i).click();

    // Assert - Kontrollera att navigering fungerade och registreringsformulär visas
    await expect(page).toHaveURL(/register/); // URL ska innehålla "register"
    await expect(page.getByPlaceholder(/email/i)).toBeVisible(); // Email-fält ska finnas på registreringssidan också
  });

  test("ska validera tomma fält", async ({ page }: { page: Page }) => {
    // Arrange - Gå till login-sidan
    await page.goto("/");

    // Act - Försök logga in utan att fylla i något (testar validering)
    await page.getByRole("button", { name: /logga in/i }).click();

    // Assert - Användaren ska förbli på login-sidan (inloggning nekad)
    await expect(page).toHaveURL("/"); // Ingen redirect ska ske vid tom inloggning
  });
});

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Arrange - Mock autentisering för alla navigeringstester
    // Vi skapar en falsk inloggad användare så vi kan testa sidorna efter login
    await page.goto("/");
    await page.evaluate(() => {
      // Lägger till fake användardata i localStorage (simulerar inloggning)
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: "test-user-123",
          email: "test@example.com",
        }),
      );
    });
  });

  test("ska navigera till kalender", async ({ page }: { page: Page }) => {
    // Act - Navigera till kalendersidan (kräver inloggning)
    await page.goto("/calendar");

    // Assert - Kontrollera att vi kom fram till kalendern
    await expect(page).toHaveURL("/calendar"); // URL ska vara exakt "/calendar"
  });

  test("ska navigera till anslagstavla", async ({ page }: { page: Page }) => {
    // Act - Navigera till anslagstavlan (bulletin board)
    await page.goto("/bulletinboard");

    // Assert - Kontrollera att vi kom fram till anslagstavlan
    await expect(page).toHaveURL("/bulletinboard"); // URL ska vara exakt "/bulletinboard"
  });

  test("ska navigera till general chat", async ({ page }: { page: Page }) => {
    // Act - Navigera till allmänna chatten
    await page.goto("/generalchat");

    // Assert - Kontrollera att vi kom fram till chatten
    await expect(page).toHaveURL(/generalchat/i); // URL ska innehålla "generalchat" (case-insensitive)
  });

  test("ska navigera till profil", async ({ page }: { page: Page }) => {
    // Act - Navigera till användarens profilsida
    await page.goto("/profile");

    // Assert - Kontrollera att vi kom fram till profilen
    await expect(page).toHaveURL("/profile"); // URL ska vara exakt "/profile"
  });
});

test.describe("Responsiv design", () => {
  test("ska fungera på mobil", async ({ page }: { page: Page }) => {
    // Arrange - Ställ in mobilstorlek (iPhone 12-liknande)
    await page.setViewportSize({ width: 390, height: 844 });

    // Act - Ladda startsidan med mobilstorlek
    await page.goto("/");

    // Assert - Email-fältet ska vara synligt även på liten skärm
    await expect(page.getByPlaceholder(/email/i)).toBeVisible(); // Formulär ska fungera på mobil
  });

  test("ska fungera på desktop", async ({ page }: { page: Page }) => {
    // Arrange - Ställ in desktopstorlek (Full HD)
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Act - Ladda startsidan med desktopstorlek
    await page.goto("/");

    // Assert - Email-fältet ska vara synligt på stor skärm
    await expect(page.getByPlaceholder(/email/i)).toBeVisible(); // Formulär ska fungera på desktop
  });
});
