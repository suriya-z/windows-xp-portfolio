import { describe, expect, it } from 'vitest';
import { fitWindow, layoutWindow } from './windowPlacement';

const phone = { width: 375, height: 812 };

describe('window layout', () => {
  it('fills the whole workspace above the taskbar on a phone', () => {
    const myComputer = { x: 40, y: 30, w: 600, h: 440, isMaximized: false };

    expect(layoutWindow(myComputer, phone)).toEqual({
      left: 0,
      top: 0,
      width: 375,
      height: 782,
      maximized: true,
    });
  });

  it('keeps a dialog dialog-sized on a phone, shrunk and centred to fit', () => {
    const runDialog = { x: 80, y: 320, w: 380, h: 180, isMaximized: false, isDialog: true };

    expect(layoutWindow(runDialog, phone)).toEqual({
      left: 8,
      top: 301,
      width: 359,
      height: 180,
      maximized: false,
    });
  });

  it('moves a window that would open past the screen edge back inside the workspace', () => {
    const notepad = { x: 480, y: 110, w: 420, h: 520, isMaximized: false };

    expect(fitWindow(notepad, { width: 800, height: 600 })).toMatchObject({ x: 380, y: 50, w: 420, h: 520 });
  });
});
