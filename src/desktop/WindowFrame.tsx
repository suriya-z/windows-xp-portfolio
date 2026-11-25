import React, { memo, Suspense } from 'react';
import type { AppWindow } from '../apps';
import { SafeIcon } from '../components/SafeIcon';
import { trackPointer } from '../os/drag';
import type { AppId } from '../os/apps';
import type { Launch } from '../os/shell';
import { isCompact, layoutWindow, type Viewport } from '../os/windowPlacement';
import type { ResizeDirection, WindowState } from '../types/os';

/** Where a minimizing window shrinks to: its taskbar button, relative to the window's centre. */
export interface MinimizeTarget {
  dx: number;
  dy: number;
}

const RESIZE_HANDLES: { edge: ResizeDirection; className: string }[] = [
  { edge: 'n', className: 'top-0 left-2 right-2 h-1.5 cursor-n-resize' },
  { edge: 's', className: 'bottom-0 left-2 right-4 h-1.5 cursor-s-resize' },
  { edge: 'w', className: 'left-0 top-2 bottom-2 w-1.5 cursor-w-resize' },
  { edge: 'e', className: 'right-0 top-2 bottom-4 w-1.5 cursor-e-resize' },
  { edge: 'nw', className: 'top-0 left-0 w-2.5 h-2.5 cursor-nw-resize' },
  { edge: 'ne', className: 'top-0 right-0 w-2.5 h-2.5 cursor-ne-resize' },
  { edge: 'sw', className: 'bottom-0 left-0 w-3 h-3 cursor-sw-resize' },
];

/** The Luna window around an app: title bar, minimize/maximize/close, and the edges that resize it. */
export const WindowFrame = memo(function WindowFrame({
  win,
  title,
  icon,
  viewport,
  isActive,
  flush,
  minimizeTo,
  onFocus,
  onMinimize,
  onMaximize,
  onClose,
  onMove,
  onResize,
  body: Body,
  launch,
}: {
  win: WindowState;
  title: string;
  icon: string;
  viewport: Viewport;
  isActive: boolean;
  /** Draws its app edge to edge on the XP face colour, rather than inset on white. */
  flush: boolean;
  minimizeTo?: MinimizeTarget;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onClose: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, edge: ResizeDirection, from: { x: number; y: number; w: number; h: number }, dx: number, dy: number) => void;
  /** The app drawn inside, and what it was last opened with. */
  body: AppWindow;
  launch?: Launch;
}) {
  const layout = layoutWindow(win, viewport);
  // Dragged and resized only on a large screen, and not while maximized.
  const canArrange = !isCompact(viewport) && !layout.maximized;
  // Minimized windows stay mounted (hidden) so what is inside them survives.
  const isHidden = win.isMinimized && !win.isAnimating;
  const isMinimizing = win.isAnimating === 'minimizing';
  const isRestoring = win.isAnimating === 'restoring';
  const shrink = minimizeTo
    ? `translate(${minimizeTo.dx}px, ${minimizeTo.dy}px) scale(0.1)`
    : 'scale(0.3) translateY(240px)';

  const startMove = (e: React.PointerEvent) => {
    // A press on Minimize, Maximize or Close is a click on that button, not the start of a drag.
    if (e.button !== 0 || (e.target as Element).closest('button')) return;
    onFocus(win.id);
    if (!canArrange) return;
    trackPointer(e, (dx, dy) => onMove(win.id, win.x + dx, win.y + dy));
  };

  const startResize = (e: React.PointerEvent, edge: ResizeDirection) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    onFocus(win.id);
    if (!canArrange) return;
    const from = { x: win.x, y: win.y, w: win.w, h: win.h };
    trackPointer(e, (dx, dy) => onResize(win.id, edge, from, dx, dy));
  };

  return (
    <div
      // Focus on press, not release, so a button inside that opens another window leaves that one on top.
      onPointerDown={() => onFocus(win.id)}
      role="dialog"
      aria-label={title}
      data-window-id={win.id}
      tabIndex={-1}
      className={`absolute flex flex-col outline-none ${isActive ? 'xp-window-frame' : 'xp-window-frame-inactive'}`}
      style={{
        top: layout.maximized ? 0 : `${layout.top}px`,
        left: layout.maximized ? 0 : `${layout.left}px`,
        width: layout.maximized ? '100%' : `${layout.width}px`,
        height: layout.maximized ? '100%' : `${layout.height}px`,
        zIndex: win.zIndex,
        display: isHidden ? 'none' : undefined,
        backgroundColor: 'var(--win-bg)',
        borderRadius: '8px 8px 0 0',
        transition: win.isAnimating ? 'transform 180ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease' : undefined,
        transform: isMinimizing ? shrink : isRestoring ? 'none' : undefined,
        opacity: isMinimizing ? 0 : 1,
        pointerEvents: win.isAnimating ? 'none' : undefined,
      }}
    >
      {/* Title bar: drag to move, double-click to maximize */}
      <div
        onPointerDown={startMove}
        onDoubleClick={(e) => {
          if ((e.target as Element).closest('button')) return;
          onMaximize(win.id);
        }}
        className={`xp-titlebar flex items-center justify-between px-2 select-none cursor-move text-white border-b border-[#0038b8] ${isActive ? 'xp-titlebar-active' : 'xp-titlebar-inactive'}`}
        style={{ touchAction: 'none', borderTopLeftRadius: '7px', borderTopRightRadius: '7px' }}
      >
        <span className="xp-titlebar-text font-bold truncate px-1 flex-1 flex items-center justify-start space-x-1.5">
          <SafeIcon src={icon} className="w-4 h-4 object-contain inline-block flex-shrink-0" size={16} alt="" />
          <span className="truncate">{title}</span>
        </span>

        {/* Minimize, Maximize & Close Controls (Authentic XP Luna Bevels) */}
        <div className="flex items-center space-x-1 pr-0.5">
          <button
            onClick={() => onMinimize(win.id)}
            title="Minimize"
            className="w-[21px] h-[21px] rounded-[3px] border border-[#0831d9] bg-gradient-to-b from-[#2568ea] via-[#1044cf] to-[#1449d6] text-white xp-ctrl-btn flex items-center justify-center cursor-pointer"
          >
            <span className="w-2.5 h-[2.5px] bg-white mt-2.5 shadow-sm"></span>
          </button>
          <button
            onClick={() => onMaximize(win.id)}
            title={win.isMaximized ? 'Restore' : 'Maximize'}
            className="w-[21px] h-[21px] rounded-[3px] border border-[#0831d9] bg-gradient-to-b from-[#2568ea] via-[#1044cf] to-[#1449d6] text-white xp-ctrl-btn flex items-center justify-center cursor-pointer"
          >
            <span className="w-2.5 h-2.5 border-[2px] border-white shadow-sm"></span>
          </button>
          <button
            onClick={() => onClose(win.id)}
            title="Close"
            className="w-[21px] h-[21px] rounded-[3px] border border-[#7a1200] bg-gradient-to-b from-[#e5563a] via-[#c92408] to-[#b31b02] text-white xp-ctrl-btn xp-close-btn flex items-center justify-center font-sans font-bold text-xp-body cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* The app */}
      <div
        data-window-body
        className={`flex-1 relative flex flex-col min-h-0 min-w-0 ${
          flush ? 'p-0 overflow-hidden bg-[#ece9d8]' : 'overflow-auto bg-white text-black p-1'
        }`}
      >
        <Suspense fallback={null}>
          <Body id={win.id as AppId} launch={launch} />
        </Suspense>
      </div>

      {/* Edges and corners that resize the window */}
      {canArrange && !layout.maximized && (
        <>
          {RESIZE_HANDLES.map(({ edge, className }) => (
            <div
              key={edge}
              onPointerDown={(e) => startResize(e, edge)}
              className={`absolute z-30 ${className}`}
              style={{ touchAction: 'none' }}
            />
          ))}
          {/* Bottom-right corner with authentic Luna grip dots */}
          <div
            onPointerDown={(e) => startResize(e, 'se')}
            title="Drag to resize"
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 z-30 select-none opacity-60 hover:opacity-100"
            style={{ touchAction: 'none' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" className="pointer-events-none">
              {[[8.5, 8.5], [5.5, 8.5], [2.5, 8.5], [8.5, 5.5], [5.5, 5.5], [8.5, 2.5]].map(([cx, cy]) => (
                <g key={`${cx}-${cy}`}>
                  <circle cx={cx} cy={cy} r="1" fill="#7f7f7f" />
                  <circle cx={cx - 0.5} cy={cy - 0.5} r="1" fill="#ffffff" />
                </g>
              ))}
            </svg>
          </div>
        </>
      )}
    </div>
  );
});
