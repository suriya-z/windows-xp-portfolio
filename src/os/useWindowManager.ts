import { useMemo, useReducer, useRef } from 'react';
import type { ResizeDirection } from '../types/os';
import { createDesk, windowManager } from './windowManager';
import type { Viewport } from './windowPlacement';

/** Length of the minimize and restore animations, in milliseconds. */
export const WINDOW_ANIMATION_MS = 180;

/** The window manager as React state: every change goes through `windowManager`. */
export function useWindowManager(viewport: Viewport) {
  const [desk, dispatch] = useReducer(windowManager, viewport, createDesk);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  // The actions never change identity, so components that only receive them need not re-render.
  const actions = useMemo(() => {
    const animate = (id: string) =>
      setTimeout(() => dispatch({ type: 'animationEnd', id }), WINDOW_ANIMATION_MS);
    return {
      open: (id: string) => dispatch({ type: 'open', id, viewport: viewportRef.current }),
      focus: (id: string) => dispatch({ type: 'focus', id }),
      close: (id: string) => dispatch({ type: 'close', id }),
      minimize: (id: string) => {
        dispatch({ type: 'minimize', id });
        animate(id);
      },
      restore: (id: string) => {
        dispatch({ type: 'restore', id });
        animate(id);
      },
      toggleMaximize: (id: string) => dispatch({ type: 'toggleMaximize', id }),
      showDesktop: () => dispatch({ type: 'showDesktop' }),
      fit: (viewport: Viewport) => dispatch({ type: 'fit', viewport }),
      blur: () => dispatch({ type: 'blur' }),
      move: (id: string, x: number, y: number) => dispatch({ type: 'move', id, x, y, viewport: viewportRef.current }),
      resize: (id: string, edge: ResizeDirection, from: { x: number; y: number; w: number; h: number }, dx: number, dy: number) =>
        dispatch({ type: 'resize', id, edge, from, dx, dy }),
      setCaption: (id: string, caption: string, icon?: string) => dispatch({ type: 'setCaption', id, caption, icon }),
    };
  }, []);

  return { windows: desk.windows, activeId: desk.activeId, ...actions };
}

export type WindowManager = ReturnType<typeof useWindowManager>;
