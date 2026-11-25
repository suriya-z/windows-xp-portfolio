import { createElement, lazy, type ComponentType } from 'react';
import type { AppId } from '../os/apps';
import type { AppProps } from '../os/shell';

/** An app's window body, whose code is downloaded the first time it is needed (or `preload`ed before then). */
export type AppWindow = ComponentType<AppProps> & { preload: () => Promise<void> };

const lazyApp = (load: () => Promise<{ default: ComponentType<AppProps> }>): AppWindow => {
  let loaded: ComponentType<AppProps> | null = null;
  let loading: Promise<void> | null = null;
  const preload = () => (loading ??= load().then((module) => void (loaded = module.default)));
  const Suspending = lazy(() => preload().then(() => ({ default: loaded! })));
  // Once the code is here, draw it straight away instead of suspending for a frame.
  const Window = (props: AppProps) => createElement(loaded ?? Suspending, props);
  return Object.assign(Window, { preload });
};

const Explorer = lazyApp(() => import('./explorer/ExplorerWindow'));

/** What each app draws inside its window. Every app in APPS (src/os/apps.ts) must have one. */
export const APP_WINDOWS: Record<AppId, AppWindow> = {
  my_computer: Explorer,
  my_documents: Explorer,
  control: Explorer,
  notepad: lazyApp(() => import('./notepad/NotepadWindow')),
  my_projects: lazyApp(() => import('./projects/ProjectsWindow')),
  contact: lazyApp(() => import('./contact/ContactWindow')),
  internet_explorer: lazyApp(() => import('./internetExplorer/InternetExplorerWindow')),
  paint: lazyApp(() => import('./paint/PaintWindow')),
  reversi: lazyApp(() => import('./reversi/ReversiWindow')),
  calc: lazyApp(() => import('./calculator/CalculatorWindow')),
  clock: lazyApp(() => import('./clock/ClockWindow')),
  recycle: lazyApp(() => import('./recycle/RecycleBinWindow')),
  run_cmd: lazyApp(() => import('./run/RunWindow')),
  welcome: lazyApp(() => import('./welcome/WelcomeWindow')),
  error_dialog: lazyApp(() => import('./dialog/SystemDialogWindow')),
};

/** Downloads every app's code, so later windows open without a wait. */
export const preloadAllApps = () => Promise.all(Object.values(APP_WINDOWS).map((app) => app.preload()));
