// Exempel på test - ta bort när du lägger till riktiga tester
import { describe, it, expect } from 'vitest';

describe('Exempel Test', () => {
  it('ska visa hur enkla tester fungerar', () => {
    // Arrange - Förbered data
    const expected = true;
    
    // Act - Gör något
    const result = true;
    
    // Assert - Kontrollera resultat
    expect(result).toBe(expected);
  });
});