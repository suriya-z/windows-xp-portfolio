import type { ResizeDirection, WindowState } from '../types/os';
import { initialWindows } from './apps';
import { fitWindow, TASKBAR_HEIGHT, type Viewport } from './windowPlacement';

/** How much of a title bar stays on screen, across, however far a window is dragged. */
const TITLE_GRIP = 40;
const TITLE_BAR_HEIGHT = 30;

/** Lowest z-index a window can have; the desktop icons sit below it. */
export const WINDOW_LAYER = 20;
/** z-index of the context menu, Start menu and taskbar; every window stays below it. */
export const MENU_LAYER = 50;

export interface Desk {
  windows: WindowState[];
  /** The window that has the keyboard and the highlighted title bar, if any. */
  activeId: string | null;
}

export type WindowAction =
  /** Opens the window (fitted to `viewport` if it was closed), un-minimizes it and brings it to the front. */
  | { type: 'open'; id: string; viewport: Viewport }
  | { type: 'focus'; id: string }
  | { type: 'close'; id: string }
  | { type: 'minimize'; id: string }
  | { type: 'restore'; id: string }
  /** The minimize or restore animation of this window has finished. */
  | { type: 'animationEnd'; id: string }
  /** The app inside names what it is showing; cleared when the window closes. */
  | { type: 'setCaption'; id: string; caption: string; icon?: string }
  | { type: 'toggleMaximize'; id: string }
  /** Drags the window to (x, y), keeping enough of its title bar inside `viewport` to grab it again. */
  | { type: 'move'; id: string; x: number; y: number; viewport: Viewport }
  /** Minimizes every open window, or restores them all when none is showing. */
  | { type: 'showDesktop' }
  /** The screen changed size: pull every open window back inside it. */
  | { type: 'fit'; viewport: Viewport }
  /** The empty desktop was clicked: no window is active, though all stay where they are. */
  | { type: 'blur' }
  /** Drags `edge` of the window by (dx, dy) from where it was when the drag started. */
  | { type: 'resize'; id: string; edge: ResizeDirection; from: Rect; dx: number; dy: number };

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One axis of a resize: the far edge moves freely, the near edge moves the origin, both stop at `min`. */
const stretch = (pos: number, size: number, delta: number, min: number, nearEdge: boolean) =>
  nearEdge
    ? { pos: pos + size - Math.max(min, size - delta), size: Math.max(min, size - delta) }
    : { pos, size: Math.max(min, size + delta) };

const update = (windows: WindowState[], id: string, change: Partial<WindowState>) =>
  windows.map((w) => (w.id === id ? { ...w, ...change } : w));

/** Keeps focus where it is unless that window is gone from view, then hands it to the top visible window. */
const settleFocus = (windows: WindowState[], activeId: string | null): Desk => {
  const active = windows.find((w) => w.id === activeId);
  return { windows, activeId: active && isVisible(active) ? activeId : topVisible(windows) };
};

/** Gives the open windows consecutive layers in their current stacking order, with `topId` last. */
const restack = (windows: WindowState[], topId?: string): WindowState[] => {
  const order = windows
    .filter((w) => w.isOpen)
    .sort((a, b) => (a.id === topId ? 1 : b.id === topId ? -1 : a.zIndex - b.zIndex))
    .map((w) => w.id);
  return windows.map((w) => ({ ...w, zIndex: w.isOpen ? WINDOW_LAYER + order.indexOf(w.id) : 0 }));
};

/** On screen and staying there: open, not minimized and not on its way to the taskbar. */
const isVisible = (w: WindowState) => w.isOpen && !w.isMinimized && w.isAnimating !== 'minimizing';

const topVisible = (windows: WindowState[]) =>
  windows.filter(isVisible).sort((a, b) => b.zIndex - a.zIndex)[0]?.id ?? null;

export const createDesk = (viewport: Viewport): Desk => {
  const windows = restack(initialWindows(viewport));
  return { windows, activeId: topVisible(windows) };
};

export const windowManager = (desk: Desk, action: WindowAction): Desk => {
  switch (action.type) {
    case 'open': {
      const windows = desk.windows.map((w) =>
        w.id !== action.id
          ? w
          : {
              ...(w.isOpen ? w : fitWindow({ ...w, isOpen: true, caption: undefined, captionIcon: undefined }, action.viewport)),
              isMinimized: false,
              isAnimating: null,
            },
      );
      return windowManager({ ...desk, windows }, { type: 'focus', id: action.id });
    }
    case 'focus':
      return { windows: restack(desk.windows, action.id), activeId: action.id };
    case 'close':
      return settleFocus(restack(update(desk.windows, action.id, { isOpen: false })), desk.activeId);
    case 'minimize':
      return settleFocus(update(desk.windows, action.id, { isAnimating: 'minimizing' }), desk.activeId);
    case 'restore':
      return windowManager(
        { ...desk, windows: update(desk.windows, action.id, { isMinimized: false, isAnimating: 'restoring' }) },
        { type: 'focus', id: action.id },
      );
    case 'resize': {
      const { edge, from, dx, dy } = action;
      const win = desk.windows.find((w) => w.id === action.id)!;
      const across = edge.includes('e') || edge.includes('w')
        ? stretch(from.x, from.w, dx, win.minW, edge.includes('w'))
        : { pos: from.x, size: from.w };
      const down = edge.includes('n') || edge.includes('s')
        ? stretch(from.y, from.h, dy, win.minH, edge.includes('n'))
        : { pos: from.y, size: from.h };
      return { ...desk, windows: update(desk.windows, action.id, { x: across.pos, w: across.size, y: down.pos, h: down.size }) };
    }
    case 'toggleMaximize': {
      const isMaximized = !desk.windows.find((w) => w.id === action.id)?.isMaximized;
      return { ...desk, windows: update(desk.windows, action.id, { isMaximized }) };
    }
    case 'move': {
      const win = desk.windows.find((w) => w.id === action.id)!;
      const { width, height } = action.viewport;
      const x = Math.min(Math.max(action.x, TITLE_GRIP - win.w), width - TITLE_GRIP);
      const y = Math.min(Math.max(action.y, 0), height - TASKBAR_HEIGHT - TITLE_BAR_HEIGHT);
      return { ...desk, windows: update(desk.windows, action.id, { x, y }) };
    }
    case 'setCaption':
      return { ...desk, windows: update(desk.windows, action.id, { caption: action.caption, captionIcon: action.icon }) };
    case 'showDesktop': {
      const hide = desk.windows.some(isVisible);
      const windows = desk.windows.map((w) => (w.isOpen ? { ...w, isMinimized: hide, isAnimating: null } : w));
      return { windows, activeId: hide ? null : topVisible(windows) };
    }
    case 'fit':
      return { ...desk, windows: desk.windows.map((w) => (w.isOpen ? fitWindow(w, action.viewport) : w)) };
    case 'blur':
      return { ...desk, activeId: null };
    case 'animationEnd': {
      const animating = desk.windows.find((w) => w.id === action.id)?.isAnimating;
      if (!animating) return desk;
      const change = animating === 'minimizing' ? { isMinimized: true, isAnimating: null } : { isAnimating: null };
      return { ...desk, windows: update(desk.windows, action.id, change) };
    }
  }
};
