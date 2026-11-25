export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  isAnimating?: 'minimizing' | 'restoring' | null;
  /** Fixed-size dialog: stays dialog-sized on a phone instead of filling the screen. */
  isDialog?: boolean;
  /** Smallest size the user can drag the window to. */
  minW: number;
  minH: number;
  /** Title-bar text the app inside has set (for example the open document), shown instead of `title`. */
  caption?: string;
  /** Title-bar icon the app inside has set, shown instead of the app's own icon. */
  captionIcon?: string;
}

export type ResizeDirection = 'se' | 'e' | 's' | 'w' | 'n' | 'ne' | 'nw' | 'sw';
