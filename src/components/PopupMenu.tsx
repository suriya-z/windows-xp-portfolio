import React, { useState } from 'react';
import { sound } from '../os/sound';

/**
 * One command in a menu. Without `onSelect` or `items` it is greyed out, as Windows shows commands that are
 * unavailable. With `items` it opens a submenu.
 */
export interface MenuItem {
  label: string;
  onSelect?: () => void;
  /** Shows a tick, for an option that is on or off (Word Wrap, Status Bar). */
  checked?: boolean;
  items?: MenuEntry[];
}

export type MenuEntry = MenuItem | 'separator';

const ENABLED = '[role^="menuitem"]:not([aria-disabled="true"])';

/**
 * A drop-down or right-click menu. It takes the keyboard when it opens: Up and Down walk the commands, Right opens a
 * submenu, Left or Escape closes this menu (`onClose`), and choosing a command closes every menu (`onDone`).
 */
export function PopupMenu({
  label,
  items,
  onClose,
  onDone,
  className = '',
  style,
}: {
  label: string;
  items: MenuEntry[];
  onClose: () => void;
  onDone: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const moveFocus = (menu: HTMLElement, step: number) => {
    const commands = [...menu.querySelectorAll(`:scope > div > ${ENABLED}`)] as HTMLElement[];
    if (commands.length === 0) return;
    const at = commands.indexOf(document.activeElement as HTMLElement);
    commands[(at + step + commands.length) % commands.length].focus();
  };

  return (
    <div
      role="menu"
      aria-label={label}
      ref={(el) => {
        // Opening a menu puts focus on its first command.
        if (el && !el.contains(document.activeElement)) {
          (el.querySelector(`:scope > div > ${ENABLED}`) as HTMLElement | null)?.focus();
        }
      }}
      onKeyDown={(e) => {
        if (e.target instanceof Element && e.target.closest('[role="menu"]') !== e.currentTarget) return;
        const back = e.key === 'Escape' || (e.key === 'ArrowLeft' && className.includes('xp-submenu'));
        if (back) {
          // Handled here: the desktop must not also close the window or menu this one belongs to.
          e.preventDefault();
          e.stopPropagation();
          onClose();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          moveFocus(e.currentTarget, e.key === 'ArrowDown' ? 1 : -1);
        }
      }}
      className={`absolute z-50 xp-context-menu py-0.5 min-w-[160px] ${className}`}
      style={style}
    >
      {items.map((item, i) =>
        item === 'separator' ? (
          <div key={i} role="separator" className="xp-context-menu-separator" />
        ) : (
          <div key={item.label} className="relative">
            <button
              role={item.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
              aria-checked={item.checked}
              aria-disabled={item.onSelect || item.items ? undefined : true}
              aria-haspopup={item.items ? 'menu' : undefined}
              aria-expanded={item.items ? openSubmenu === item.label : undefined}
              onMouseEnter={() => setOpenSubmenu(item.items ? item.label : null)}
              onKeyDown={(e) => {
                if (item.items && (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenSubmenu(item.label);
                }
              }}
              onClick={() => {
                if (item.items) return setOpenSubmenu(item.label);
                if (!item.onSelect) return;
                sound.play('menu');
                onDone();
                item.onSelect();
              }}
              className="xp-context-menu-item w-full text-left whitespace-nowrap"
            >
              {item.checked && <span className="absolute left-2" aria-hidden="true">✓</span>}
              {item.label}
              {item.items && <span className="ml-auto pl-4" aria-hidden="true">▸</span>}
            </button>
            {item.items && openSubmenu === item.label && (
              <PopupMenu
                label={item.label}
                items={item.items}
                onClose={() => {
                  setOpenSubmenu(null);
                  // Back to the command that opened the submenu.
                  (document.querySelector(`[aria-label="${label}"] [aria-haspopup][aria-expanded="true"]`) as HTMLElement | null)?.focus();
                }}
                onDone={onDone}
                className="xp-submenu left-full top-0 -mt-0.5"
              />
            )}
          </div>
        ),
      )}
    </div>
  );
}
