import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

const bootToDesktop = (viewport = { width: 1280, height: 720 }) => {
  window.innerWidth = viewport.width;
  window.innerHeight = viewport.height;
  vi.useFakeTimers();
  render(<App />);
  act(() => vi.advanceTimersByTime(5000)); // boot screen
  fireEvent.click(screen.getByRole('button', { name: /AI Engineer/ })); // user tile on the login screen
  act(() => vi.advanceTimersByTime(2000)); // logging on
};

const openStartMenu = () => {
  fireEvent.click(screen.getByRole('button', { name: /^start$/i }));
  return screen.getByRole('dialog', { name: 'Start menu' });
};

describe('starting up', () => {
  it('skips the boot screen when any key is pressed', () => {
    vi.useFakeTimers();
    render(<App />);

    fireEvent.keyDown(window, { key: 'Enter' });

    expect(screen.getByRole('button', { name: /AI Engineer/ })).toBeVisible();
  });

  it('takes a returning visitor straight to the desktop', () => {
    bootToDesktop();
    cleanup();

    render(<App />);

    expect(screen.getByRole('button', { name: /^start$/i })).toBeVisible();
  });
});

describe('first visit', () => {
  it('welcomes a first-time visitor with the way to the resume, projects and contact', () => {
    bootToDesktop();
    const welcome = screen.getByRole('dialog', { name: 'Welcome' });

    expect(welcome).toHaveTextContent(/double-click/i);
    fireEvent.click(within(welcome).getByRole('button', { name: /My Projects/ }));

    expect(screen.getByRole('dialog', { name: 'My Projects' })).toBeVisible();
  });

  it('does not welcome a returning visitor again', () => {
    bootToDesktop();
    cleanup();

    render(<App />);

    expect(screen.queryByRole('dialog', { name: 'Welcome' })).not.toBeInTheDocument();
  });
});

describe('Start menu', () => {
  it('offers the resume, the projects and a way to make contact', () => {
    bootToDesktop();

    const menu = openStartMenu();

    expect(within(menu).getByRole('button', { name: /Resume/ })).toBeVisible();
    expect(within(menu).getByRole('button', { name: /My Projects/ })).toBeVisible();
    expect(within(menu).getByRole('button', { name: /E-mail/ })).toBeVisible();
  });

  it('opens the Contact window from the E-mail pin', () => {
    bootToDesktop();

    fireEvent.click(within(openStartMenu()).getByRole('button', { name: /E-mail/ }));

    expect(screen.getByRole('dialog', { name: 'Contact Suriya' })).toBeVisible();
  });
});

describe('desktop', () => {
  it('shows the projects when My Projects is opened', () => {
    bootToDesktop();

    fireEvent.doubleClick(screen.getByRole('option', { name: 'My Projects' }));

    expect(within(screen.getByRole('dialog', { name: 'My Projects' })).getByText('OMNISCIENCE RAG v2')).toBeVisible();
  });

  it('opens the resume with a title that names the document', () => {
    bootToDesktop();

    fireEvent.doubleClick(screen.getByRole('option', { name: 'Resume' }));

    expect(screen.getByRole('dialog', { name: 'RESUME.TXT - Notepad' })).toBeVisible();
  });
});

describe('windows', () => {
  it('keeps what you typed in Notepad after it is minimized and restored', () => {
    bootToDesktop();
    const notepad = () => screen.getByRole('dialog', { name: /Notepad/ });
    fireEvent.change(within(notepad()).getByRole('textbox'), { target: { value: 'my notes' } });

    fireEvent.click(within(notepad()).getByTitle('Minimize'));
    act(() => vi.advanceTimersByTime(500));
    fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('button', { name: /Notepad/ }));
    act(() => vi.advanceTimersByTime(500));

    expect(within(notepad()).getByRole('textbox')).toHaveValue('my notes');
  });

  it('titles each message box for what it is about, not for the one before', () => {
    bootToDesktop();

    fireEvent.doubleClick(within(screen.getByRole('dialog', { name: 'My Computer' })).getByText('3½ Floppy (A:)'));
    const floppy = screen.getByRole('dialog', { name: 'Drive A:' });
    fireEvent.click(within(floppy).getByRole('button', { name: 'OK' }));

    fireEvent.click(within(openStartMenu()).getByRole('button', { name: 'Run...' }));
    const run = screen.getByRole('dialog', { name: 'Run' });
    fireEvent.change(within(run).getByRole('textbox'), { target: { value: 'frobnicate' } });
    fireEvent.click(within(run).getByRole('button', { name: 'OK' }));

    const notFound = screen.getAllByRole('dialog', { name: 'Run' }).find((d) => within(d).queryByText(/cannot find/));
    expect(notFound).toHaveTextContent("Windows cannot find 'frobnicate'");
  });
});

describe('keyboard', () => {
  it('closes the Start menu with Escape', () => {
    bootToDesktop();
    openStartMenu();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: 'Start menu' })).not.toBeInTheDocument();
  });

  it('closes a message box with Escape', () => {
    bootToDesktop();
    fireEvent.doubleClick(within(screen.getByRole('dialog', { name: 'My Computer' })).getByText('3½ Floppy (A:)'));
    expect(screen.getByRole('dialog', { name: 'Drive A:' })).toBeVisible();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: 'Drive A:' })).not.toBeInTheDocument();
  });

  it('moves focus into a window opened from the keyboard', () => {
    bootToDesktop();

    fireEvent.keyDown(screen.getByRole('option', { name: 'Resume' }), { key: 'Enter' });

    expect(within(screen.getByRole('dialog', { name: 'RESUME.TXT - Notepad' })).getByRole('textbox')).toHaveFocus();
  });
});

describe('keyboard on the desktop', () => {
  const icon = (name: string) => within(screen.getByRole('listbox', { name: 'Desktop' })).getByRole('option', { name });

  it('puts the keyboard on the first Start menu entry and walks the entries with the arrow keys', () => {
    bootToDesktop();
    const menu = openStartMenu();
    const entries = within(menu).getAllByRole('button');

    expect(entries[0]).toHaveFocus();
    fireEvent.keyDown(entries[0], { key: 'ArrowDown' });
    expect(entries[1]).toHaveFocus();
  });

  it('opens an icon with Space and moves between icons with the arrow keys, as one Tab stop', () => {
    bootToDesktop();
    const tabStops = within(screen.getByRole('listbox', { name: 'Desktop' }))
      .getAllByRole('option')
      .filter((option) => option.tabIndex === 0);
    expect(tabStops).toHaveLength(1);

    fireEvent.keyDown(icon('My Computer'), { key: 'ArrowDown' });
    expect(icon('My Projects')).toHaveFocus();
    fireEvent.keyDown(icon('My Projects'), { key: 'ArrowRight' });
    expect(icon('Notepad')).toHaveFocus();

    fireEvent.keyDown(icon('Notepad'), { key: ' ' });
    expect(screen.getByRole('dialog', { name: /Notepad/ })).toBeVisible();
  });

  it('arranges the icons by name from the keyboard', () => {
    bootToDesktop();

    fireEvent.keyDown(icon('My Computer'), { key: 'F10', shiftKey: true });
    const arrange = screen.getByRole('menuitem', { name: 'Arrange Icons By' });
    expect(arrange).toHaveFocus();
    fireEvent.keyDown(arrange, { key: 'ArrowRight' });
    fireEvent.click(within(screen.getByRole('menu', { name: 'Arrange Icons By' })).getByRole('menuitem', { name: 'Name' }));

    // Calculator comes first alphabetically: top of the first column.
    expect(icon('Calculator')).toHaveStyle({ left: '16px', top: '16px' });
    expect(screen.queryByRole('menu', { name: 'Desktop' })).not.toBeInTheDocument();
  });

  it('shows on the taskbar which window is active', () => {
    bootToDesktop();
    const taskbar = within(screen.getByRole('contentinfo'));

    // A first visit opens Welcome on top of Notepad and My Computer.
    expect(taskbar.getByRole('button', { name: /Welcome/, pressed: true })).toBeVisible();
    expect(taskbar.getByRole('button', { name: /Notepad/, pressed: false })).toBeVisible();
  });

  it('names the page with a heading for screen readers', () => {
    bootToDesktop();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Suriya, AI Engineer/);
  });
});

describe('pointer inside a window', () => {
  const drag = (target: Element, from: { x: number; y: number }, to: { x: number; y: number }) => {
    fireEvent.pointerDown(target, { clientX: from.x, clientY: from.y, pointerId: 1, button: 0 });
    fireEvent.pointerMove(window, { clientX: to.x, clientY: to.y, pointerId: 1 });
    fireEvent.pointerUp(window, { clientX: to.x, clientY: to.y, pointerId: 1 });
  };

  it('selects no desktop icons when dragging across text in a window', () => {
    bootToDesktop();
    const editor = within(screen.getByRole('dialog', { name: /Notepad/ })).getByRole('textbox');

    drag(editor, { x: 650, y: 200 }, { x: 10, y: 10 });

    const icons = within(screen.getByRole('listbox', { name: 'Desktop' })).getAllByRole('option');
    expect(icons.filter((icon) => icon.getAttribute('aria-selected') === 'true')).toHaveLength(0);
  });

  it("leaves right-click inside a window to the browser's own menu", () => {
    bootToDesktop();
    const editor = within(screen.getByRole('dialog', { name: /Notepad/ })).getByRole('textbox');

    const notCancelled = fireEvent.contextMenu(editor);

    expect(notCancelled).toBe(true);
    expect(screen.queryByText('Line up Icons')).not.toBeInTheDocument();
  });

  it('moves a window by dragging its title bar with a pen or finger as well as a mouse', () => {
    bootToDesktop();
    const notepad = screen.getByRole('dialog', { name: /Notepad/ });
    const left = parseInt(notepad.style.left);

    drag(within(notepad).getByText(/- Notepad/), { x: 700, y: 120 }, { x: 600, y: 170 });

    expect(parseInt(notepad.style.left)).toBe(left - 100);
  });
});

describe('desktop context menu', () => {
  it('lines every icon up in its own cell, with none stacked on another', () => {
    bootToDesktop();

    fireEvent.contextMenu(screen.getByRole('listbox', { name: 'Desktop' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Line up Icons' }));

    const cells = ['My Computer', 'My Projects', 'Resume', 'Contact Suriya', 'Internet Explorer', 'Recycle Bin'].map(
      (name) => {
        const icon = within(screen.getByRole('listbox', { name: 'Desktop' })).getByRole('option', { name });
        return `${icon.style.left} ${icon.style.top}`;
      },
    );
    expect(new Set(cells).size).toBe(cells.length);
  });
});

describe('on a phone', () => {
  it('opens an app with a single tap and fills the screen with it', () => {
    bootToDesktop({ width: 375, height: 812 });

    fireEvent.click(screen.getByRole('option', { name: 'My Projects' }));

    const projects = screen.getByRole('dialog', { name: 'My Projects' });
    expect(projects).toHaveStyle({ left: '0px', top: '0px', width: '100%', height: '100%' });
  });
});

