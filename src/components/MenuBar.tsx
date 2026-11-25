import React, { useEffect, useRef, useState } from 'react';
import { PopupMenu, type MenuEntry } from './PopupMenu';

export type { MenuEntry, MenuItem } from './PopupMenu';

export interface Menu {
  label: string;
  items: MenuEntry[];
}

/** A window's menu bar (File, Edit, View...), with drop-down menus; `children` sit at its right-hand end. */
export function MenuBar({
  menus,
  className = 'xp-menubar',
  children,
}: {
  menus: Menu[];
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const nameRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // A press anywhere else closes the open menu.
  useEffect(() => {
    if (!open) return;
    const closeOutside = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  return (
    <div ref={barRef} role="menubar" className={`flex items-center px-1 py-0.5 select-none relative ${className}`}>
      {menus.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            ref={(el) => {
              nameRefs.current[menu.label] = el;
            }}
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={open === menu.label}
            onClick={() => setOpen(open === menu.label ? null : menu.label)}
            // Once a menu is open, pointing at another menu name opens that one, as in Windows.
            onMouseEnter={() => open && open !== menu.label && setOpen(menu.label)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setOpen(menu.label);
              }
            }}
            className={`xp-menubar-item ${open === menu.label ? 'xp-menubar-item-open' : ''}`}
          >
            {menu.label}
          </button>
          {open === menu.label && (
            <PopupMenu
              label={menu.label}
              items={menu.items}
              onClose={() => {
                setOpen(null);
                nameRefs.current[menu.label]?.focus();
              }}
              onDone={() => {
                setOpen(null);
                nameRefs.current[menu.label]?.focus();
              }}
              className="left-0 top-full"
            />
          )}
        </div>
      ))}
      {children}
    </div>
  );
}
