import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderInShell } from '../../test/shell';
import CalculatorWindow from './CalculatorWindow';

describe('Calculator window', () => {
  it('makes the number shown negative from the +/- key', () => {
    renderInShell(<CalculatorWindow id="calc" />);

    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: '+/-' }));

    expect(screen.getByRole('status')).toHaveTextContent('-5');
  });
});
