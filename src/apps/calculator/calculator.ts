/** State of the Standard-mode calculator. */
export interface Calculator {
  display: string;
  /** The left-hand number waiting for `op`. */
  memory: number | null;
  op: string | null;
  /** The next digit starts a new number instead of extending the display. */
  fresh: boolean;
}

export const newCalculator = (): Calculator => ({ display: '0', memory: null, op: null, fresh: false });

const apply = (a: number, b: number, op: string): number => {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : 0;
    default: return b;
  }
};

/** Presses one key: a digit, '.', an operator (+ - * /), '=', '+/-', 'C', 'CE' or 'back'. */
export const press = (calc: Calculator, key: string): Calculator => {
  if (/^[0-9.]$/.test(key)) {
    const startNew = calc.display === '0' || calc.fresh;
    if (key === '.') {
      if (startNew) return { ...calc, display: '0.', fresh: false };
      return calc.display.includes('.') ? calc : { ...calc, display: `${calc.display}.` };
    }
    return { ...calc, display: startNew ? key : calc.display + key, fresh: false };
  }
  if (key === 'C') return newCalculator();
  if (key === 'CE') return { ...calc, display: '0' };
  if (key === '+/-') {
    if (calc.display === '0') return calc;
    return { ...calc, display: calc.display.startsWith('-') ? calc.display.slice(1) : `-${calc.display}` };
  }
  if (key === 'back') return { ...calc, display: calc.display.length > 1 ? calc.display.slice(0, -1) : '0' };

  // An operator or '='
  const shown = parseFloat(calc.display);
  if (calc.op && calc.memory !== null && !calc.fresh) {
    const result = apply(calc.memory, shown, calc.op);
    return { display: String(result), memory: result, op: key === '=' ? null : key, fresh: true };
  }
  return { ...calc, memory: shown, op: key === '=' ? null : key, fresh: true };
};
