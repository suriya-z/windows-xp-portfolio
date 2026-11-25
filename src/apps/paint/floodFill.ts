/** The pixels of a canvas, as ImageData holds them: RGBA, row by row. */
export interface Pixels {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

/** Colours this close count as the same, so anti-aliased edges fill cleanly. */
const TOLERANCE = 15;

/**
 * Paint-bucket fill: recolours the area of near-identical colour around (x, y) with `hex` (#rrggbb).
 * Changes `image` in place and returns whether anything changed.
 */
export const floodFill = (image: Pixels, x: number, y: number, hex: string): boolean => {
  const { data, width, height } = image;
  const fill = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const start = (y * width + x) * 4;
  const target = [data[start], data[start + 1], data[start + 2]];
  const near = (i: number, colour: number[], tolerance: number) =>
    Math.abs(data[i] - colour[0]) < tolerance &&
    Math.abs(data[i + 1] - colour[1]) < tolerance &&
    Math.abs(data[i + 2] - colour[2]) < tolerance;

  // Already that colour: nothing to do (and filling would never finish).
  if (near(start, fill, 5)) return false;

  const visited = new Uint8Array(width * height);
  const queue: [number, number][] = [[x, y]];
  while (queue.length) {
    const [cx, cy] = queue.pop()!;
    const pixel = cy * width + cx;
    if (visited[pixel]) continue;
    visited[pixel] = 1;
    const i = pixel * 4;
    if (!near(i, target, TOLERANCE)) continue;
    data[i] = fill[0];
    data[i + 1] = fill[1];
    data[i + 2] = fill[2];
    data[i + 3] = 255;
    if (cx > 0) queue.push([cx - 1, cy]);
    if (cx < width - 1) queue.push([cx + 1, cy]);
    if (cy > 0) queue.push([cx, cy - 1]);
    if (cy < height - 1) queue.push([cx, cy + 1]);
  }
  return true;
};
