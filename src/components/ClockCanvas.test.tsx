import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ClockCanvas } from './ClockCanvas';

describe('analog clock', () => {
  it('tells screen readers the time it shows, and keeps it current', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 21, 10, 7, 30));
    render(<ClockCanvas />);

    expect(screen.getByRole('img', { name: /10:07/ })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByRole('img', { name: /10:08/ })).toBeInTheDocument();
  });
});
