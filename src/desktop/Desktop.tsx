import React, { useEffect, useRef, useState } from 'react';
import { PopupMenu } from '../components/PopupMenu';
import { SafeIcon } from '../components/SafeIcon';
import { DESKTOP_SHORTCUTS, defaultShortcutPositions, gridPositions, type DesktopShortcut } from '../os/apps';
import { trackPointer } from '../os/drag';
import { sound } from '../os/sound';
import { MENU_LAYER } from '../os/windowManager';
import type { Viewport } from '../os/windowPlacement';

type Positions = Record<string, { x: number; y: number }>;

/** Size of one icon's cell, for hit-testing the selection box. */
const ICON_CELL = 76;

const byName = (a: DesktopShortcut, b: DesktopShortcut) => a.label.localeCompare(b.label);

/**
 * The desktop behind the windows: the shortcut icons, the selection box drawn by dragging across empty desktop, and
 * the desktop's right-click menu. Only presses on the desktop itself reach it; windows sit beside it, not inside it.
 */
export default function Desktop({
  viewport,
  compact,
  recycleEmpty,
  onOpen,
  onPress,
  onProperties,
}: {
  viewport: Viewport;
  compact: boolean;
  recycleEmpty: boolean;
  onOpen: (shortcut: DesktopShortcut) => void;
  /** The empty desktop was pressed: menus close and no window is active. */
  onPress: () => void;
  onProperties: () => void;
}) {
  const [positions, setPositions] = useState<Positions>(defaultShortcutPositions);
  const [selected, setSelected] = useState<string[]>([]);
  /** The one icon that is in the Tab order; arrow keys move it. */
  const [current, setCurrent] = useState(DESKTOP_SHORTCUTS[0].id);
  const [box, setBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [menuAt, setMenuAt] = useState<{ x: number; y: number } | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const iconRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => () => clearTimeout(tooltipTimer.current), []);

  // A press anywhere outside the right-click menu closes it.
  useEffect(() => {
    if (!menuAt) return;
    const closeOutside = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.('[role="menu"][aria-label="Desktop"]')) setMenuAt(null);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [menuAt]);

  // A smaller screen pulls icons back onto it.
  useEffect(() => {
    setPositions((prev) =>
      Object.fromEntries(
        Object.entries(prev as Positions).map(([id, pos]) => [
          id,
          { x: Math.min(pos.x, Math.max(0, viewport.width - 88)), y: Math.min(pos.y, Math.max(0, viewport.height - 120)) },
        ]),
      ),
    );
  }, [viewport.width, viewport.height]);

  const open = (shortcut: DesktopShortcut) => {
    setSelected([]);
    onOpen(shortcut);
  };

  const showMenu = (x: number, y: number) =>
    setMenuAt({ x: Math.min(x, viewport.width - 180), y: Math.min(y, viewport.height - 160) });

  const focusIcon = (id: string) => {
    setCurrent(id);
    setSelected([id]);
    iconRefs.current[id]?.focus();
  };

  /** The next icon from `from` in a direction: Up/Down within the column, Left/Right to the nearest in the next column. */
  const neighbour = (from: string, key: string): string | undefined => {
    const at = positions[from];
    const others = DESKTOP_SHORTCUTS.map((s) => s.id).filter((id) => id !== from);
    const candidates = others.filter((id) => {
      const p = positions[id];
      if (key === 'ArrowDown') return p.x === at.x && p.y > at.y;
      if (key === 'ArrowUp') return p.x === at.x && p.y < at.y;
      if (key === 'ArrowRight') return p.x > at.x;
      return p.x < at.x;
    });
    const distance = (id: string) => Math.abs(positions[id].x - at.x) * 2 + Math.abs(positions[id].y - at.y);
    return candidates.sort((a, b) => distance(a) - distance(b))[0];
  };

  const pressIcon = (e: React.PointerEvent, shortcut: DesktopShortcut) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setMenuAt(null);
    setCurrent(shortcut.id);
    setSelected([shortcut.id]);
    sound.play('click');
    const start = positions[shortcut.id];
    trackPointer(e, (dx, dy) =>
      setPositions((prev) => ({
        ...prev,
        [shortcut.id]: {
          x: Math.max(0, Math.min(start.x + dx, viewport.width - 80)),
          y: Math.max(0, Math.min(start.y + dy, viewport.height - 120)),
        },
      })),
    );
  };

  const pressDesktop = (e: React.PointerEvent<HTMLDivElement>) => {
    // Presses on an icon are the icon's; everything else here is empty desktop.
    if (e.button !== 0 || e.target !== e.currentTarget) return;
    onPress();
    setSelected([]);
    setMenuAt(null);
    const origin = e.currentTarget.getBoundingClientRect();
    const x1 = e.clientX - origin.left;
    const y1 = e.clientY - origin.top;
    trackPointer(
      e,
      (_dx, _dy, at) => {
        const x2 = at.x - origin.left;
        const y2 = at.y - origin.top;
        setBox({ x1, y1, x2, y2 });
        const [left, right] = [Math.min(x1, x2), Math.max(x1, x2)];
        const [top, bottom] = [Math.min(y1, y2), Math.max(y1, y2)];
        setSelected(
          Object.entries(positions as Positions)
            .filter(([, p]) => p.x + ICON_CELL >= left && p.x <= right && p.y + ICON_CELL >= top && p.y <= bottom)
            .map(([id]) => id),
        );
      },
      () => setBox(null),
    );
  };

  const arrange = (order: DesktopShortcut[]) => setPositions(gridPositions(order.map((s) => s.id)));

  return (
    <>
      <div
        role="listbox"
        aria-label="Desktop"
        aria-multiselectable="true"
        aria-orientation="vertical"
        onPointerDown={pressDesktop}
        onContextMenu={(e) => {
          e.preventDefault();
          showMenu(e.clientX, e.clientY);
        }}
        className="absolute inset-0 select-none z-10"
        style={{ touchAction: 'none' }}
      >
        {/* Selection box, drawn while dragging across empty desktop */}
        {box && (
          <div
            className="absolute pointer-events-none border border-[#316ac5] bg-[#316ac5]/25"
            style={{
              left: Math.min(box.x1, box.x2),
              top: Math.min(box.y1, box.y2),
              width: Math.abs(box.x2 - box.x1),
              height: Math.abs(box.y2 - box.y1),
            }}
          />
        )}

        {DESKTOP_SHORTCUTS.map((shortcut) => {
          const pos = positions[shortcut.id];
          const isSelected = selected.includes(shortcut.id);
          const icon = shortcut.opens === 'recycle' && recycleEmpty ? '/assets/xp-icons/Recycle Bin (empty).png' : shortcut.icon;
          return (
            <div
              key={shortcut.id}
              ref={(el) => {
                iconRefs.current[shortcut.id] = el;
              }}
              role="option"
              aria-selected={isSelected}
              aria-label={shortcut.label}
              tabIndex={current === shortcut.id ? 0 : -1}
              onPointerDown={(e) => pressIcon(e, shortcut)}
              onMouseEnter={(e) => {
                clearTimeout(tooltipTimer.current);
                const at = { x: e.clientX + 10, y: e.clientY + 18 };
                tooltipTimer.current = setTimeout(() => setTooltip({ text: shortcut.label, ...at }), 450);
              }}
              onMouseLeave={() => {
                clearTimeout(tooltipTimer.current);
                setTooltip(null);
              }}
              onDoubleClick={() => open(shortcut)}
              onClick={() => {
                // Touch screens have no double-click: one tap opens.
                if (compact) open(shortcut);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  open(shortcut);
                } else if (e.key.startsWith('Arrow')) {
                  e.preventDefault();
                  const next = neighbour(shortcut.id, e.key);
                  if (next) focusIcon(next);
                } else if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
                  e.preventDefault();
                  showMenu(pos.x + 40, pos.y + 40);
                }
              }}
              onFocus={() => setCurrent(shortcut.id)}
              className={`absolute flex flex-col items-center justify-center py-1 rounded-sm w-[76px] cursor-pointer ${
                isSelected ? 'bg-[#316ac5]/40 border border-[#316ac5]/70' : 'hover:bg-white/10'
              }`}
              style={{ left: `${pos.x}px`, top: `${pos.y}px`, touchAction: 'none' }}
            >
              <SafeIcon src={icon} className="w-8 h-8 object-contain drop-shadow-[1px_2px_2px_rgba(0,0,0,0.5)] pointer-events-none" size={32} alt="" />
              <span
                className={`mt-1 font-sans text-xp-body leading-tight text-center px-0.5 py-0.5 rounded-xs line-clamp-2 break-words w-full pointer-events-none ${
                  isSelected
                    ? 'bg-[#0b61d6] text-white border border-[#ffffff]/40'
                    : 'text-white font-medium [text-shadow:1px_1px_2px_#000,0px_0px_2px_#000]'
                }`}
              >
                {shortcut.label}
              </span>
            </div>
          );
        })}
      </div>

      {menuAt && (
        <PopupMenu
          label="Desktop"
          items={[
            {
              label: 'Arrange Icons By',
              items: [
                { label: 'Name', onSelect: () => arrange([...DESKTOP_SHORTCUTS].sort(byName)) },
                {
                  label: 'Type',
                  // Documents first, then programs and folders, each by name.
                  onSelect: () =>
                    arrange([...DESKTOP_SHORTCUTS].sort((a, b) => Number(!a.file) - Number(!b.file) || byName(a, b))),
                },
              ],
            },
            { label: 'Line up Icons', onSelect: () => setPositions(defaultShortcutPositions()) },
            'separator',
            { label: 'Properties', onSelect: onProperties },
          ]}
          onClose={() => {
            setMenuAt(null);
            iconRefs.current[current]?.focus();
          }}
          onDone={() => setMenuAt(null)}
          style={{ left: menuAt.x, top: menuAt.y, zIndex: MENU_LAYER }}
        />
      )}

      {/* Pale yellow XP tooltip */}
      {tooltip && (
        <div className="xp-tooltip" style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}>
          {tooltip.text}
        </div>
      )}
    </>
  );
}
