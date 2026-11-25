const ICON_DIR = '/assets/xp-icons/';

/** Picks the pixel size closest to how large the icon is drawn: 16px art up to 20px, 32px art above. */
export const iconUrl = (src: string, size: number): string => {
  if (!src.startsWith(ICON_DIR)) return src;
  const file = src.slice(ICON_DIR.length).replace(/^(16|32)\//, '');
  return `${ICON_DIR}${size <= 20 ? 16 : 32}/${file}`;
};
