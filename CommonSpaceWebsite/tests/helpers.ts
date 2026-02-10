// Hjälpfunktioner för tester
// Lägg till gemensamma testverktyg och utilities här

/**
 * Exempel på hjälpfunktion för tester
 * Ta bort denna fil när du lägger till riktiga utilities
 */

export const createMockUser = () => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com'
});

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Hjälpfunktion för att rendera komponenter med providers
 */
export const renderWithProviders = (component: React.ReactElement) => {
  // Implementera rendering med nödvändiga providers
  // (AuthContext, Router, etc.)
};