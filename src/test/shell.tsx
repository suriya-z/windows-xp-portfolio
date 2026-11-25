import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { vi } from 'vitest';
import { ShellContext, type Shell } from '../os/shell';

/** A desktop shell that records what an app asks of it, for testing one app window on its own. */
export const testShell = (overrides: Partial<Shell> = {}): Shell => ({
  open: vi.fn(),
  close: vi.fn(),
  showDialog: vi.fn(),
  setCaption: vi.fn(),
  dialog: { title: '', message: '', icon: '' },
  recycleEmpty: false,
  emptyRecycleBin: vi.fn(),
  ...overrides,
});

export const renderInShell = (ui: ReactElement, shell: Shell = testShell()) => {
  const view = render(<ShellContext.Provider value={shell}>{ui}</ShellContext.Provider>);
  return {
    shell,
    ...view,
    rerender: (next: ReactElement) => view.rerender(<ShellContext.Provider value={shell}>{next}</ShellContext.Provider>),
  };
};
