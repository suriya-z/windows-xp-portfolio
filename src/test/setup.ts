import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';
import { preloadAllApps } from '../apps';

// jsdom has no audio, canvas or scrolling; the desktop only needs them not to throw.
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};
window.HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
window.Element.prototype.scrollIntoView = () => {};

// App code normally arrives on demand; tests render it straight away.
beforeAll(() => preloadAllApps());

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  // Each test is a first visit: forget a log-on remembered by the test before.
  localStorage.clear();
});
