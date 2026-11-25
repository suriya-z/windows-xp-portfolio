import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Calculator as CalcIcon,
  Clock as ClockIcon,
  FileText,
  Folder,
  Gamepad2,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  LogOut,
  Mail,
  Monitor,
  Music as MusicIcon,
  Network,
  Palette,
  Play,
  Power,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { iconUrl } from '../os/icons';

/** A line icon to show when an XP icon file fails to load, matched on words in its file name. */
const FALLBACKS: [string[], typeof Monitor][] = [
  [['computer', 'disk', 'desktop', 'cd-rom', 'floppy'], Monitor],
  [['notepad', 'documents'], FileText],
  [['messenger'], Sparkles],
  [['paint', 'appearance'], Palette],
  [['reversi', 'solitaire', 'game'], Gamepad2],
  [['calculator'], CalcIcon],
  [['date and time', 'recent'], ClockIcon],
  [['folder', 'projects'], Folder],
  [['control panel', 'programs', 'performance'], Settings],
  [['recycle'], Trash2],
  [['internet explorer', 'ie '], Globe],
  [['outlook'], Mail],
  [['pictures'], ImageIcon],
  [['music', 'volume'], MusicIcon],
  [['network', 'connection'], Network],
  [['security'], ShieldCheck],
  [['help'], HelpCircle],
  [['search'], Search],
  [['run'], Play],
  [['critical', 'error'], AlertOctagon],
  [['alert'], AlertTriangle],
  [['logout'], LogOut],
  [['power'], Power],
];

const fallbackFor = (src: string) => {
  const name = (src || '').toLowerCase();
  return FALLBACKS.find(([words]) => words.some((w) => name.includes(w)))?.[1] ?? Monitor;
};

export const SafeIcon: React.FC<{
  src: string;
  className?: string;
  size?: number;
  alt?: string;
  /** Tooltip. */
  title?: string;
}> = ({ src, className, size = 16, alt = '', title }) => {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    const Fallback = fallbackFor(src);
    return <Fallback size={size} className={className} aria-label={alt || undefined} />;
  }
  return (
    <img
      src={iconUrl(src, size)}
      className={className}
      // Drawn at a whole multiple of the pixel art: keep the pixels crisp on high-density screens.
      style={size % 16 === 0 ? { imageRendering: 'pixelated' } : undefined}
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
      alt={alt}
      title={title}
    />
  );
};

export default SafeIcon;
