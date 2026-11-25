import React, { useId } from 'react';

// Outline paths come from the Windows XP logo file on Wikimedia Commons
// ("Windows logo - 2002-2012 (Multicolored).svg"). Only the path
// data is used; the shading is applied here. The logo is a trademark of Microsoft.

type Pane = 'red' | 'green' | 'blue' | 'yellow';

// Waving-flag shading: the left panes run light to dark, the right panes dark to light.
const SHADING: Record<Pane, [string, string, string]> = {
  red: ['#f98a55', '#e94e22', '#c5361b'],
  green: ['#63ac2c', '#7cbf36', '#a3d552'],
  blue: ['#74acf2', '#3f7fdb', '#2459b8'],
  yellow: ['#e89d14', '#f9b923', '#ffd95a'],
};

const PaneGradients: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    {(Object.keys(SHADING) as Pane[]).map((pane) => (
      <linearGradient key={pane} id={`${id}-${pane}`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0%" stopColor={SHADING[pane][0]} />
        <stop offset="50%" stopColor={SHADING[pane][1]} />
        <stop offset="100%" stopColor={SHADING[pane][2]} />
      </linearGradient>
    ))}
  </defs>
);

/** The Windows XP flag on its own. */
export const XPLogo: React.FC<{ className?: string }> = ({ className }) => {
  const id = useId();
  return (
    <svg viewBox="0 0 170.3 147" className={className} aria-hidden="true">
      <PaneGradients id={id} />
      <path d="M82.2 67.3a53.9 53.9 0 0 0-31-11.3c-8.7-.1-19.1 2.4-32.2 7.8L35.2 7.4c33.1-13.7 49-6 63.3 3.7L82.2 67.3z" fill={`url(#${id}-red)`} />
      <path d="M170 20.7c-33 13.7-49 6-63.2-3.6L90.8 73.5c14.3 9.7 31.5 17.7 63.2 3.5l16.3-56.3z" fill={`url(#${id}-green)`} />
      <path d="M63 134.2c-14.3-9.6-30-17.6-63-3.9l16.2-56.6c33-13.6 49-5.9 63.3 3.8L63 134.2z" fill={`url(#${id}-blue)`} />
      <path d="M88 83c14.4 9.6 30.3 17.3 63.3 3.6L135 142.8c-33 13.7-48.9 6-63.2-3.7L88.1 83z" fill={`url(#${id}-yellow)`} />
    </svg>
  );
};

export default XPLogo;
