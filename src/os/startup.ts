/** How the desktop starts: the boot screen, and whether this visitor has been here before. */

const LOGGED_ON_KEY = 'xp-portfolio:logged-on';

/** The boot screen shows the logo for at least this long, however fast loading is... */
export const BOOT_MIN_MS = 1500;
/** ...and never longer than this, however slow. */
export const BOOT_MAX_MS = 4500;

/** What the boot screen waits for: the first things the desktop draws. */
export const BOOT_ASSETS = ['/assets/bliss.avif'];

// Browser storage can be missing or throw (private windows, blocked site data); then every visit is a first one.
export const hasLoggedOnBefore = (): boolean => {
  try {
    return localStorage.getItem(LOGGED_ON_KEY) === '1';
  } catch {
    return false;
  }
};

export const rememberLogOn = () => {
  try {
    localStorage.setItem(LOGGED_ON_KEY, '1');
  } catch {
    // Not remembered: the next visit boots as normal.
  }
};

export const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Settles once every image has loaded or failed. */
export const preloadImages = (urls: string[]): Promise<void> =>
  Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = url;
        }),
    ),
  ).then(() => undefined);
