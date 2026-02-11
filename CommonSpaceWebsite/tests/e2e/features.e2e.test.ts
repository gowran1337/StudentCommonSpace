// E2E test för chat-funktionalitet
import { test, expect, type Page } from "@playwright/test";

test.describe("General Chat", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Arrange - Skapa en mock-inloggad användare för alla chat-tester
    // Chat-funktioner kräver att användaren är inloggad
    await page.goto("/");
    await page.evaluate(() => {
      // Lägger till fake användardata inklusive flatCode för chat-funktioner
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: "test-user-123",
          email: "test@example.com",
          flatCode: "TEST123", // Lägenhetskod behövs för att kunna chatta
        }),
      );
    });
  });

  test("ska visa chat-sidan", async ({ page }: { page: Page }) => {
    // Act - Navigera till allmänna chat-sidan
    await page.goto("/generalchat");

    // Assert - Kontrollera att vi kom fram till chat-sidan
    await expect(page).toHaveURL(/generalchat/i); // URL ska innehålla "generalchat"
  });

  test("ska visa meddelandeformulär", async ({ page }: { page: Page }) => {
    // Act - Gå till chat-sidan och leta efter formulärelement
    await page.goto("/generalchat");

    // Assert - Kontrollera att chat-formuläret finns och är användbart
    await expect(
      page.getByPlaceholder(/skriv|meddelande|message/i),
    ).toBeVisible(); // Input-fält för meddelanden
    await expect(
      page.getByRole("button", { name: /skicka|send/i }),
    ).toBeVisible(); // Skicka-knapp
  });

  test("ska kunna skriva meddelande", async ({ page }: { page: Page }) => {
    // Arrange - Gå till chat och hitta meddelande-fältet
    await page.goto("/generalchat");
    const messageInput = page.getByPlaceholder(/skriv|meddelande|message/i);

    // Act - Skriv ett testmeddelande i input-fältet
    await messageInput.fill("Hej från test!");

    // Assert - Kontrollera att texten sparades i fältet
    await expect(messageInput).toHaveValue("Hej från test!"); // Texten ska finnas kvar i input-fältet
  });
});

test.describe("Profil", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Arrange - Skapa mock-användare för profiltester
    // Profilsidan kräver inloggning för att visa användardata
    await page.goto("/");
    await page.evaluate(() => {
      // Lägger till grundläggande användardata för profiltester
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: "test-user-123",
          email: "test@example.com",
        }),
      );
    });
  });

  test("ska visa profil-sidan", async ({ page }: { page: Page }) => {
    // Act - Navigera till användarens profilsida
    await page.goto("/profile");

    // Assert - Kontrollera att vi kom fram till profilsidan
    await expect(page).toHaveURL("/profile"); // URL ska vara exakt "/profile"
  });
});

test.describe("Kalender", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Arrange - Skapa mock-användare för kalendertester
    // Kalendern kräver inloggning för att visa användarens händelser
    await page.goto("/");
    await page.evaluate(() => {
      // Lägger till användardata för kalenderfunktioner
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: "test-user-123",
          email: "test@example.com",
        }),
      );
    });
  });

  test("ska visa kalender-sidan", async ({ page }: { page: Page }) => {
    // Act - Navigera till kalendersidan
    await page.goto("/calendar");

    // Assert - Kontrollera att vi kom fram till kalendern
    await expect(page).toHaveURL("/calendar"); // URL ska vara exakt "/calendar"
  });
});
