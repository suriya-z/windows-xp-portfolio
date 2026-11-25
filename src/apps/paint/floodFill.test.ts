import { describe, expect, it } from 'vitest';
import { floodFill } from './floodFill';

const WHITE = [255, 255, 255, 255];
const BLACK = [0, 0, 0, 255];

/** A picture from rows of letters: w = white, b = black. */
const picture = (...rows: string[]) => ({
  width: rows[0].length,
  height: rows.length,
  data: new Uint8ClampedArray(rows.join('').split('').flatMap((c) => (c === 'b' ? BLACK : WHITE))),
});

/** Reads the picture back as letters: w = white, b = black, r = red. */
const look = (img: ReturnType<typeof picture>) =>
  Array.from({ length: img.height }, (_, y) =>
    Array.from({ length: img.width }, (_, x) => {
      const [r, g, b] = img.data.slice((y * img.width + x) * 4, (y * img.width + x) * 4 + 3);
      return r === 255 && g === 0 && b === 0 ? 'r' : r === 0 ? 'b' : 'w';
    }).join(''),
  );

describe('paint bucket', () => {
  it('fills the area clicked up to the lines around it', () => {
    const img = picture('wbw', 'wbw', 'wbw');

    floodFill(img, 0, 1, '#ff0000');

    expect(look(img)).toEqual(['rbw', 'rbw', 'rbw']);
  });
});
