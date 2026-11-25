import type { WindowState } from '../types/os';
import { fitWindow, isCompact, type Viewport } from './windowPlacement';

export type AppId =
  | 'my_computer'
  | 'notepad'
  | 'my_projects'
  | 'contact'
  | 'my_documents'
  | 'internet_explorer'
  | 'paint'
  | 'reversi'
  | 'calc'
  | 'clock'
  | 'control'
  | 'recycle'
  | 'run_cmd'
  | 'welcome'
  | 'error_dialog';

/** Everything the desktop needs to know about one program, except what it draws (see src/apps). */
export interface AppDefinition {
  id: AppId;
  /** Window title, and the name used everywhere else unless `menuLabel` is given. */
  title: string;
  /** Shorter name for the Start menu, when the window title is long. */
  menuLabel?: string;
  icon: string;
  window: {
    x: number;
    y: number;
    w: number;
    h: number;
    /** Smallest size the user can drag the window to; 320 x 220 when not given. */
    minW?: number;
    minH?: number;
    /** Fixed-size dialog: stays dialog-sized on a phone instead of filling the screen. */
    isDialog?: boolean;
    /** Open when the desktop first appears; later entries sit on top. */
    openAtStartup?: boolean;
  };
  /** Names that open it from Start > Run. */
  runNames?: string[];
  /** Draws edge to edge on the XP face colour (Explorer-style), rather than inset on white. */
  flush?: boolean;
  /** Listed under Start > All Programs. */
  inAllPrograms?: boolean;
}

// Default positions start right of the three desktop icon columns (which end at x = 284).
export const APPS: AppDefinition[] = [
  {
    id: 'my_computer', title: 'My Computer', icon: '/assets/xp-icons/My Computer.png', flush: true, inAllPrograms: true,
    window: { x: 320, y: 40, w: 600, h: 440, minW: 480, minH: 340, openAtStartup: true },
    runNames: ['explorer', 'mycomputer', 'msdos', 'ms-dos', 'dos'],
  },
  {
    id: 'notepad', title: 'Notepad', icon: '/assets/xp-icons/Notepad.png', inAllPrograms: true,
    window: { x: 600, y: 110, w: 440, h: 440, openAtStartup: true },
    runNames: ['notepad', 'notepad.exe'],
  },
  {
    id: 'my_projects', title: 'My Projects', icon: '/assets/xp-icons/My Projects.png', inAllPrograms: true,
    window: { x: 330, y: 70, w: 620, h: 460 },
    runNames: ['projects', 'portfolio'],
  },
  {
    id: 'contact', title: 'Contact Suriya', icon: '/assets/xp-icons/Outlook Express.png', inAllPrograms: true,
    window: { x: 400, y: 100, w: 440, h: 330 },
    runNames: ['contact', 'mail', 'email', 'outlook', 'msimn'],
  },
  {
    id: 'my_documents', title: 'My Documents', icon: '/assets/xp-icons/My Documents.png', flush: true,
    window: { x: 340, y: 90, w: 580, h: 440, minW: 480, minH: 340 },
    runNames: ['documents', 'mydocuments'],
  },
  {
    id: 'internet_explorer', title: 'Internet Explorer', icon: '/assets/xp-icons/Internet Explorer 6.png', flush: true,
    window: { x: 330, y: 50, w: 640, h: 480, minW: 480, minH: 340 },
    runNames: ['ie', 'iexplore', 'iexplore.exe', 'internet'],
  },
  {
    id: 'paint', title: 'Paint', icon: '/assets/xp-icons/Paint.png', inAllPrograms: true,
    window: { x: 360, y: 60, w: 480, h: 450 },
    runNames: ['paint', 'paint.exe', 'mspaint', 'mspaint.exe'],
  },
  {
    id: 'reversi', title: 'Internet Reversi', icon: '/assets/xp-icons/Internet Reversi.png', inAllPrograms: true,
    window: { x: 400, y: 50, w: 380, h: 460 },
    runNames: ['reversi', 'solitaire', 'cards'],
  },
  {
    id: 'calc', title: 'Calculator', icon: '/assets/xp-icons/Calculator.png', inAllPrograms: true,
    window: { x: 520, y: 150, w: 260, h: 330, minW: 220, minH: 200, isDialog: true },
    runNames: ['calc', 'calc.exe', 'calculator'],
  },
  {
    id: 'clock', title: 'Date and Time Properties', menuLabel: 'Date and Time', icon: '/assets/xp-icons/Date and Time.png',
    inAllPrograms: true,
    window: { x: 560, y: 90, w: 220, h: 220, minW: 220, minH: 200, isDialog: true },
    runNames: ['clock', 'time', 'timedate.cpl'],
  },
  {
    id: 'control', title: 'Control Panel', icon: '/assets/xp-icons/Control Panel.png', flush: true, inAllPrograms: true,
    window: { x: 320, y: 70, w: 620, h: 460, minW: 480, minH: 340 },
    runNames: ['control', 'settings'],
  },
  {
    id: 'recycle', title: 'Recycle Bin', icon: '/assets/xp-icons/Recycle Bin (full).png', inAllPrograms: true,
    window: { x: 420, y: 150, w: 350, h: 250 },
    runNames: ['recycle', 'bin', 'trash'],
  },
  {
    id: 'welcome', title: 'Welcome', icon: '/assets/xp-icons/Tour XP.png',
    window: { x: 440, y: 130, w: 400, h: 300, isDialog: true },
    runNames: ['welcome', 'tour'],
  },
  {
    id: 'run_cmd', title: 'Run', icon: '/assets/xp-icons/Run.png',
    window: { x: 16, y: 320, w: 380, h: 180, isDialog: true },
  },
  {
    id: 'error_dialog', title: 'Run', icon: '/assets/xp-icons/Help and Support.png',
    window: { x: 440, y: 240, w: 320, h: 145, isDialog: true },
  },
];

export const appById = (id: string): AppDefinition => {
  const app = APPS.find((a) => a.id === id);
  if (!app) throw new Error(`No app called ${id}`);
  return app;
};

/** The icon for an app; the Recycle Bin shows whether it is empty. */
export const appIcon = (id: string, { recycleEmpty = false } = {}): string =>
  id === 'recycle' && recycleEmpty ? '/assets/xp-icons/Recycle Bin (empty).png' : appById(id).icon;

export const menuLabel = (app: AppDefinition) => app.menuLabel ?? app.title;

/** Start > All Programs, sorted by name as in Windows XP. */
export const ALL_PROGRAMS = APPS.filter((a) => a.inAllPrograms).sort((a, b) => menuLabel(a).localeCompare(menuLabel(b)));

export type RunResult = { open: AppId } | { browse: string } | null;

/** What Start > Run does with the text typed into it: a program, a web address, or nothing it knows. */
export const parseRunCommand = (text: string): RunResult => {
  const typed = text.trim();
  const name = typed.toLowerCase();
  if (!name) return null;
  const app = APPS.find((a) => a.runNames?.includes(name));
  if (app) return { open: app.id };
  if (name.includes('.') || /^https?:\/\//.test(name)) return { browse: webAddress(typed) };
  return null;
};

/** A typed address as Internet Explorer would load it: with a scheme. */
export const webAddress = (typed: string) => {
  const address = typed.trim();
  return /^https?:\/\//i.test(address) ? address : `http://${address}`;
};

/** Something on the desktop or in the Start menu that opens an app, optionally with a document. */
export interface Launcher {
  label: string;
  opens: AppId;
  /** Document to load into the window first, if any. */
  file?: string;
}

export interface DesktopShortcut extends Launcher {
  /** Unique key; also the selection id on the desktop. */
  id: string;
  icon: string;
  x: number;
  y: number;
}

const COLUMN = [16, 112, 208];
const ROW = [16, 112, 208, 304, 400];

const shortcut = (id: string, label: string, opens: AppId, x: number, y: number, file?: string): DesktopShortcut => ({
  id,
  label,
  opens,
  file,
  icon: appIcon(opens),
  x,
  y,
});

export const DESKTOP_SHORTCUTS: DesktopShortcut[] = [
  // Column 1: the portfolio itself
  shortcut('my_computer', 'My Computer', 'my_computer', COLUMN[0], ROW[0]),
  shortcut('my_projects', 'My Projects', 'my_projects', COLUMN[0], ROW[1]),
  shortcut('resume', 'Resume', 'notepad', COLUMN[0], ROW[2], 'RESUME.TXT'),
  shortcut('contact', 'Contact Suriya', 'contact', COLUMN[0], ROW[3]),
  // Column 2: programs
  shortcut('internet_explorer', 'Internet Explorer', 'internet_explorer', COLUMN[1], ROW[0]),
  shortcut('notepad', 'Notepad', 'notepad', COLUMN[1], ROW[1]),
  shortcut('paint', 'Paint', 'paint', COLUMN[1], ROW[2]),
  shortcut('reversi', 'Internet Reversi', 'reversi', COLUMN[1], ROW[3]),
  shortcut('calc', 'Calculator', 'calc', COLUMN[1], ROW[4]),
  // Column 3: system
  shortcut('my_documents', 'My Documents', 'my_documents', COLUMN[2], ROW[0]),
  shortcut('control', 'Control Panel', 'control', COLUMN[2], ROW[1]),
  shortcut('recycle', 'Recycle Bin', 'recycle', COLUMN[2], ROW[2]),
];

/** The Start menu's left column, below Internet and E-mail. */
export const START_MENU_PROGRAMS: Launcher[] = [
  { label: 'Resume', opens: 'notepad', file: 'RESUME.TXT' },
  { label: 'My Projects', opens: 'my_projects' },
  { label: 'Notepad', opens: 'notepad' },
  { label: 'Paint', opens: 'paint' },
  { label: 'Internet Reversi', opens: 'reversi' },
  { label: 'Calculator', opens: 'calc' },
];

/** Taskbar Quick Launch, after Show Desktop. */
export const QUICK_LAUNCH: AppId[] = ['internet_explorer', 'my_computer'];

export const defaultShortcutPositions = (): Record<string, { x: number; y: number }> =>
  Object.fromEntries(DESKTOP_SHORTCUTS.map((s) => [s.id, { x: s.x, y: s.y }]));

/** Lays shortcuts out in the given order, down each column of the icon grid and then across. */
export const gridPositions = (ids: string[]): Record<string, { x: number; y: number }> =>
  Object.fromEntries(
    ids.map((id, i) => [id, { x: COLUMN[Math.min(Math.floor(i / ROW.length), COLUMN.length - 1)], y: ROW[i % ROW.length] }]),
  );

/** z-index of the desktop icon grid; every window stacks above it. */
export const DESKTOP_ICON_LAYER = 10;

export const initialWindows = (viewport: Viewport): WindowState[] => {
  // Windows fill a phone screen, so only the top one is worth opening there.
  const startup = APPS.filter((a) => a.window.openAtStartup).slice(isCompact(viewport) ? -1 : 0);
  let z = DESKTOP_ICON_LAYER;
  return APPS.map(({ id, title, window: { openAtStartup, minW = 320, minH = 220, ...geometry } }) => {
    const isOpen = startup.some((a) => a.id === id);
    return fitWindow(
      { id, title, ...geometry, minW, minH, isOpen, isMinimized: false, isMaximized: false, zIndex: isOpen ? ++z : 0 },
      viewport,
    );
  });
};
