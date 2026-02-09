import { describe, it, expect } from 'vitest';
import { sanitizeText, isValidAmount, isValidEmail, isValidPassword, MAX_LENGTHS } from '../utils/validation';

describe('sanitizeText', () => {
  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ', 100)).toBe('hello');
  });

  it('truncates to maxLength', () => {
    expect(sanitizeText('abcdef', 3)).toBe('abc');
  });

  it('handles empty string', () => {
    expect(sanitizeText('', 100)).toBe('');
  });

  it('handles only whitespace', () => {
    expect(sanitizeText('   ', 100)).toBe('');
  });
});

describe('isValidAmount', () => {
  it('accepts positive numbers', () => {
    expect(isValidAmount('100')).toBe(true);
    expect(isValidAmount('0.50')).toBe(true);
  });

  it('rejects zero', () => {
    expect(isValidAmount('0')).toBe(false);
  });

  it('rejects negative numbers', () => {
    expect(isValidAmount('-10')).toBe(false);
  });

  it('rejects non-numeric strings', () => {
    expect(isValidAmount('abc')).toBe(false);
    expect(isValidAmount('')).toBe(false);
  });

  it('rejects absurdly large amounts', () => {
    expect(isValidAmount('9999999')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@missing.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
  });

  it('rejects overly long emails', () => {
    const long = 'a'.repeat(250) + '@b.com';
    expect(isValidEmail(long)).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('accepts passwords >= 6 chars', () => {
    expect(isValidPassword('abc123').valid).toBe(true);
  });

  it('rejects short passwords', () => {
    const result = isValidPassword('abc');
    expect(result.valid).toBe(false);
    expect(result.message).toBeDefined();
  });

  it('rejects overly long passwords', () => {
    const long = 'a'.repeat(MAX_LENGTHS.password + 1);
    expect(isValidPassword(long).valid).toBe(false);
  });
});
