import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderInShell } from '../../test/shell';
import ReversiWindow from './ReversiWindow';

describe('Internet Reversi window', () => {
  it('starts a clean game when restarted while the computer is still thinking', () => {
    vi.useFakeTimers();
    renderInShell(<ReversiWindow id="reversi" />);

    fireEvent.click(screen.getAllByRole('gridcell')[19]); // a legal first move
    expect(screen.getByText('CPU THINKING...')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /RESTART MATCH/ }));
    act(() => vi.advanceTimersByTime(5000));

    expect(screen.getByText('YOUR TURN')).toBeInTheDocument();
    expect(screen.getByText(/Blue \(User\)/)).toHaveTextContent('2');
    expect(screen.getByText(/CPU \(Suriya\)/)).toHaveTextContent('2');
  });
});
