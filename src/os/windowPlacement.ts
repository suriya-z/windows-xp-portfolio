export interface Viewport {
  width: number;
  height: number;
}

export interface PlacedWindow {
  x: number;
  y: number;
  w: number;
  h: number;
  isMaximized: boolean;
  isDialog?: boolean;
}

export interface WindowLayout {
  left: number;
  top: number;
  width: number;
  height: number;
  maximized: boolean;
}

export const TASKBAR_HEIGHT = 30;
export const COMPACT_MAX_WIDTH = 640;

export const isCompact = (viewport: Viewport) => viewport.width < COMPACT_MAX_WIDTH;

const DIALOG_MARGIN = 8;

export const layoutWindow = (win: PlacedWindow, viewport: Viewport): WindowLayout => {
  const workspaceHeight = viewport.height - TASKBAR_HEIGHT;
  if (isCompact(viewport) && win.isDialog) {
    const width = Math.min(win.w, viewport.width - DIALOG_MARGIN * 2);
    const height = Math.min(win.h, workspaceHeight - DIALOG_MARGIN * 2);
    return {
      left: Math.round((viewport.width - width) / 2),
      top: Math.round((workspaceHeight - height) / 2),
      width,
      height,
      maximized: false,
    };
  }
  if (win.isMaximized || isCompact(viewport)) {
    return { left: 0, top: 0, width: viewport.width, height: workspaceHeight, maximized: true };
  }
  return { left: win.x, top: win.y, width: win.w, height: win.h, maximized: false };
};

/** Pulls a window fully inside the workspace, shrinking it only if it is larger than the workspace. */
export const fitWindow = <T extends PlacedWindow>(win: T, viewport: Viewport): T => {
  const workspaceHeight = viewport.height - TASKBAR_HEIGHT;
  const w = Math.min(win.w, viewport.width);
  const h = Math.min(win.h, workspaceHeight);
  return {
    ...win,
    w,
    h,
    x: Math.max(0, Math.min(win.x, viewport.width - w)),
    y: Math.max(0, Math.min(win.y, workspaceHeight - h)),
  };
};
