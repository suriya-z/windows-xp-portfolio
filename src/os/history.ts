/** Back/Forward history, as in Explorer and Internet Explorer. */
export interface History<T> {
  entries: T[];
  index: number;
}

export const startHistory = <T>(first: T): History<T> => ({ entries: [first], index: 0 });

export const current = <T>(h: History<T>): T => h.entries[h.index];

export const canGoBack = <T>(h: History<T>) => h.index > 0;
export const canGoForward = <T>(h: History<T>) => h.index < h.entries.length - 1;

export const back = <T>(h: History<T>): History<T> => (canGoBack(h) ? { ...h, index: h.index - 1 } : h);
export const forward = <T>(h: History<T>): History<T> => (canGoForward(h) ? { ...h, index: h.index + 1 } : h);

/** Visits `place`, dropping anything Forward could have reached; visiting the current place changes nothing. */
export const go = <T>(h: History<T>, place: T): History<T> => {
  if (current(h) === place) return h;
  const entries = [...h.entries.slice(0, h.index + 1), place];
  return { entries, index: entries.length - 1 };
};
