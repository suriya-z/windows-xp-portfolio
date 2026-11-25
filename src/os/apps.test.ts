import { describe, expect, it } from 'vitest';
import { DESKTOP_SHORTCUTS, initialWindows, parseRunCommand } from './apps';

const ICON_CELL = { width: 76, height: 80 };

describe('desktop shortcuts', () => {
  it('gives every shortcut its own cell, so no two icons overlap', () => {
    const overlapping = DESKTOP_SHORTCUTS.flatMap((a, i) =>
      DESKTOP_SHORTCUTS.slice(i + 1)
        .filter((b) => Math.abs(a.x - b.x) < ICON_CELL.width && Math.abs(a.y - b.y) < ICON_CELL.height)
        .map((b) => `${a.label} / ${b.label}`),
    );

    expect(overlapping).toEqual([]);
  });
});

describe('Run dialog', () => {
  it('opens a program from any of its Run names, in any case', () => {
    expect(['calc', 'Calculator', 'notepad.exe', 'mspaint', 'ie', 'iexplore'].map(parseRunCommand)).toEqual([
      { open: 'calc' },
      { open: 'calc' },
      { open: 'notepad' },
      { open: 'paint' },
      { open: 'internet_explorer' },
      { open: 'internet_explorer' },
    ]);
  });

  it('opens a web address in Internet Explorer', () => {
    expect(['google.com', 'https://example.org/a', 'www.msn.com'].map(parseRunCommand)).toEqual([
      { browse: 'http://google.com' },
      { browse: 'https://example.org/a' },
      { browse: 'http://www.msn.com' },
    ]);
  });

  it('knows nothing by a name no program has', () => {
    expect(parseRunCommand('frobnicate')).toBeNull();
    expect(parseRunCommand('   ')).toBeNull();
  });
});

describe('windows', () => {
  const laptop = { width: 1280, height: 720 };

  it('titles every window with its Windows XP name, never a DOS file name', () => {
    const titles = Object.fromEntries(initialWindows(laptop).map((w) => [w.id, w.title]));

    expect(titles).toEqual({
      my_computer: 'My Computer',
      my_documents: 'My Documents',
      my_projects: 'My Projects',
      contact: 'Contact Suriya',
      notepad: 'Notepad',
      paint: 'Paint',
      reversi: 'Internet Reversi',
      calc: 'Calculator',
      clock: 'Date and Time Properties',
      control: 'Control Panel',
      recycle: 'Recycle Bin',
      internet_explorer: 'Internet Explorer',
      run_cmd: 'Run',
      error_dialog: 'Run',
      welcome: 'Welcome',
    });
  });

  it('opens with About Me on top and leaves the desktop icons uncovered', () => {
    const open = initialWindows(laptop).filter((w) => w.isOpen);
    const rightEdgeOfIcons = Math.max(...DESKTOP_SHORTCUTS.map((s) => s.x + ICON_CELL.width));

    expect(open.sort((a, b) => b.zIndex - a.zIndex).map((w) => w.id)).toEqual(['notepad', 'my_computer']);
    expect(open.every((w) => w.x >= rightEdgeOfIcons)).toBe(true);
  });

  it('opens windows in front of the desktop icons, which sit on layer 10', () => {
    const open = initialWindows(laptop).filter((w) => w.isOpen);

    expect(open.every((w) => w.zIndex > 10)).toBe(true);
  });

  it('opens only About Me on a phone, so one close reaches the desktop', () => {
    const open = initialWindows({ width: 375, height: 812 }).filter((w) => w.isOpen);

    expect(open.map((w) => w.id)).toEqual(['notepad']);
  });
});
