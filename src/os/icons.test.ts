import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { iconUrl } from './icons';

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sourceFiles(join(dir, entry.name))
      : /\.tsx?$/.test(entry.name) && !entry.name.includes('.test.')
        ? [join(dir, entry.name)]
        : [],
  );

const referencedIcons = [
  ...new Set(
    sourceFiles('src').flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/\/assets\/xp-icons\/[^'"`]+?\.png/g)].map((m) => m[0]),
    ),
  ),
];

describe('icon set', () => {
  it('serves the 16px file for small icons and the 32px file for large ones', () => {
    expect(iconUrl('/assets/xp-icons/My Computer.png', 16)).toBe('/assets/xp-icons/16/My Computer.png');
    expect(iconUrl('/assets/xp-icons/My Computer.png', 32)).toBe('/assets/xp-icons/32/My Computer.png');
  });

  it.each(referencedIcons)('%s exists on disk at 16px and 32px', (icon) => {
    for (const size of [16, 32]) {
      expect(existsSync(join('public', iconUrl(icon, size))), `${icon} at ${size}px`).toBe(true);
    }
  });
});
