import { describe, expect, it } from 'vitest';
import { back, canGoBack, canGoForward, current, forward, go, startHistory } from './history';

describe('navigation history', () => {
  it('goes back and forward through the places visited', () => {
    let h = startHistory('Home');
    h = go(h, 'Search');
    h = go(h, 'Results');
    h = back(h);
    h = back(h);

    expect(current(h)).toBe('Home');
    expect(canGoBack(h)).toBe(false);
    expect(current(forward(h))).toBe('Search');
  });

  it('forgets the forward pages once a new page is visited, and ignores a visit to the page already shown', () => {
    let h = go(go(startHistory('Home'), 'Search'), 'Results');
    h = back(back(h));
    h = go(h, 'Mail');
    h = go(h, 'Mail');

    expect(h.entries).toEqual(['Home', 'Mail']);
    expect(canGoForward(h)).toBe(false);
  });
});
