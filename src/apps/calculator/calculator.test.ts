import { describe, expect, it } from 'vitest';
import { newCalculator, press } from './calculator';

const keys = (...pressed: string[]) => pressed.reduce(press, newCalculator()).display;

describe('calculator', () => {
  it('works left to right like the Windows XP calculator', () => {
    expect(keys('1', '2', '+', '3', '*', '2', '=')).toBe('30');
  });

  it('turns the number shown negative with +/- rather than starting a subtraction', () => {
    expect(keys('5', '+/-')).toBe('-5');
    expect(keys('5', '+/-', '+', '2', '=')).toBe('-3');
    expect(keys('5', '+/-', '+/-')).toBe('5');
  });

  it('takes one decimal point per number, and starts a number with 0.', () => {
    expect(keys('1', '.', '.', '5')).toBe('1.5');
    expect(keys('.', '5')).toBe('0.5');
    expect(keys('2', '+', '.', '5', '=')).toBe('2.5');
  });
});
