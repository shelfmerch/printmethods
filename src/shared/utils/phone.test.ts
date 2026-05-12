import { describe, expect, it } from 'vitest';
import { isTenDigitPhone, sanitizeTenDigitPhone } from './phone';

describe('phone helpers', () => {
  it('keeps only digits and caps input at ten digits', () => {
    expect(sanitizeTenDigitPhone('98abc76-54 3210')).toBe('9876543210');
    expect(sanitizeTenDigitPhone('1234567890123')).toBe('1234567890');
  });

  it('validates exactly ten digits after sanitizing', () => {
    expect(isTenDigitPhone('98765')).toBe(false);
    expect(isTenDigitPhone('98765-43210')).toBe(true);
  });
});
