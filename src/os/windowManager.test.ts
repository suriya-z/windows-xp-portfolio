import { describe, expect, it } from 'vitest';
import { createDesk, MENU_LAYER, windowManager, type Desk, type WindowAction } from './windowManager';

const laptop = { width: 1280, height: 720 };

const run = (desk: Desk, ...actions: WindowAction[]) => actions.reduce(windowManager, desk);
const win = (desk: Desk, id: string) => desk.windows.find((w) => w.id === id)!;
const onTop = (desk: Desk) =>
  desk.windows.filter((w) => w.isOpen && !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0]?.id;

describe('window manager', () => {
  it('keeps every window below the menus however often windows are brought to the front', () => {
    let desk = createDesk(laptop); // My Computer and Notepad open
    for (let i = 0; i < 200; i++) {
      desk = run(desk, { type: 'focus', id: i % 2 ? 'my_computer' : 'notepad' });
    }

    expect(onTop(desk)).toBe('my_computer');
    expect(Math.max(...desk.windows.map((w) => w.zIndex))).toBeLessThan(MENU_LAYER);
  });

  it('hands focus to the window underneath when the active one closes', () => {
    const desk = run(createDesk(laptop), { type: 'close', id: 'notepad' });

    expect(win(desk, 'notepad').isOpen).toBe(false);
    expect(desk.activeId).toBe('my_computer');
  });

  it('keeps a window on screen when it is restored before its minimize animation finishes', () => {
    const desk = run(
      createDesk(laptop),
      { type: 'minimize', id: 'notepad' },
      { type: 'restore', id: 'notepad' },
      { type: 'animationEnd', id: 'notepad' }, // the minimize animation's timer fires late
      { type: 'animationEnd', id: 'notepad' },
    );

    expect(win(desk, 'notepad')).toMatchObject({ isMinimized: false, isAnimating: null });
    expect(desk.activeId).toBe('notepad');
  });

  it('opens a closed window on top and inside the screen it is opened on', () => {
    const small = { width: 800, height: 500 };
    const desk = run(createDesk(laptop), { type: 'open', id: 'internet_explorer', viewport: small });
    const ie = win(desk, 'internet_explorer');

    expect(onTop(desk)).toBe('internet_explorer');
    expect(desk.activeId).toBe('internet_explorer');
    expect(ie.x + ie.w).toBeLessThanOrEqual(small.width);
    expect(ie.y + ie.h).toBeLessThanOrEqual(small.height - 30); // above the taskbar
  });

  it('stops shrinking a window at its minimum size and keeps the opposite edge where it was', () => {
    const before = win(createDesk(laptop), 'my_computer'); // My Computer: at least 480 x 340
    const desk = run(createDesk(laptop), {
      type: 'resize',
      id: 'my_computer',
      edge: 'nw',
      from: before,
      dx: 1000,
      dy: 1000,
    });
    const after = win(desk, 'my_computer');

    expect({ w: after.w, h: after.h }).toEqual({ w: 480, h: 340 });
    expect(after.x + after.w).toBe(before.x + before.w);
    expect(after.y + after.h).toBe(before.y + before.h);
  });

  it('hides every window with Show Desktop and brings them all back with a second click', () => {
    const hidden = run(createDesk(laptop), { type: 'showDesktop' });
    const back = run(hidden, { type: 'showDesktop' });

    expect(hidden.windows.filter((w) => w.isOpen).every((w) => w.isMinimized)).toBe(true);
    expect(hidden.activeId).toBeNull();
    expect(back.windows.filter((w) => w.isOpen).every((w) => !w.isMinimized)).toBe(true);
    expect(back.activeId).toBe('notepad');
  });

  it("shows the caption an app sets until the window is closed and opened again", () => {
    const titled = run(createDesk(laptop), { type: 'setCaption', id: 'notepad', caption: 'RESUME.TXT - Notepad' });
    const reopened = run(titled, { type: 'close', id: 'notepad' }, { type: 'open', id: 'notepad', viewport: laptop });

    expect(win(titled, 'notepad').caption).toBe('RESUME.TXT - Notepad');
    expect(win(reopened, 'notepad').caption).toBeUndefined();
  });

  it('maximizes a window and puts it back where it was, and moves it when dragged', () => {
    const start = win(createDesk(laptop), 'notepad');
    const maximized = run(createDesk(laptop), { type: 'toggleMaximize', id: 'notepad' });
    const restored = run(maximized, { type: 'toggleMaximize', id: 'notepad' }, { type: 'move', id: 'notepad', x: 5, y: 7, viewport: laptop });

    expect(win(maximized, 'notepad').isMaximized).toBe(true);
    expect(win(restored, 'notepad')).toMatchObject({ isMaximized: false, x: 5, y: 7, w: start.w, h: start.h });
  });

  it('keeps enough of a dragged title bar on screen to grab it again', () => {
    const notepad = win(createDesk(laptop), 'notepad'); // 440 wide
    const up = run(createDesk(laptop), { type: 'move', id: 'notepad', x: 300, y: -600, viewport: laptop });
    const left = run(createDesk(laptop), { type: 'move', id: 'notepad', x: -5000, y: 100, viewport: laptop });
    const right = run(createDesk(laptop), { type: 'move', id: 'notepad', x: 5000, y: 5000, viewport: laptop });

    expect(win(up, 'notepad').y).toBe(0);
    expect(win(left, 'notepad').x + notepad.w).toBe(40);
    expect(win(right, 'notepad')).toMatchObject({ x: 1280 - 40, y: 720 - 30 - 30 });
  });

  it('pulls open windows back inside a screen that got smaller', () => {
    const narrow = { width: 900, height: 600 };
    const desk = run(createDesk(laptop), { type: 'fit', viewport: narrow });
    const notepad = win(desk, 'notepad');

    expect(notepad.x + notepad.w).toBeLessThanOrEqual(900);
    expect(notepad.y + notepad.h).toBeLessThanOrEqual(600 - 30);
  });

  it('leaves no window active after a click on the empty desktop', () => {
    const desk = run(createDesk(laptop), { type: 'blur' });

    expect(desk.activeId).toBeNull();
    expect(onTop(desk)).toBe('notepad');
  });
});
