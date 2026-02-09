/**
 * Input validation & sanitization utilities.
 * Used across forms to enforce consistent limits and prevent abuse.
 */

/** Max lengths for different input types */
export const MAX_LENGTHS = {
  chatMessage: 1000,
  postItText: 300,
  taskText: 200,
  shoppingItem: 150,
  expenseDescription: 200,
  calendarTitle: 150,
  calendarDescription: 500,
  email: 254,
  password: 128,
  flatCode: 11, // ABC-DEF-GHI
  bulletinText: 500,
} as const;

/** Sanitize text input: trim and limit length */
export function sanitizeText(input: string, maxLength: number): string {
  return input.trim().slice(0, maxLength);
}

/** Validate expense amount: must be positive number */
export function isValidAmount(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && num <= 999999;
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= MAX_LENGTHS.email;
}

/** Validate password strength */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) return { valid: false, message: 'Lösenordet måste vara minst 6 tecken' };
  if (password.length > MAX_LENGTHS.password) return { valid: false, message: 'Lösenordet är för långt' };
  return { valid: true };
}

/** Simple debounce function for rate limiting */
export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
