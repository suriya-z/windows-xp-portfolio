import { createContext, useContext } from 'react';
import type { AppId } from './apps';

/** What to open an app with: a document for Notepad, a page for Internet Explorer. */
export interface LaunchArgs {
  file?: string;
  url?: string;
  /** A project for My Projects to show (its id in the profile). */
  project?: string;
}

/** The most recent launch of an app; `seq` changes every time, so an open app can react to a repeat. */
export interface Launch extends LaunchArgs {
  seq: number;
}

/** The text of the shared system message box (Windows' MessageBox). */
export interface SystemDialog {
  title: string;
  message: string;
  icon: string;
}

/** What an app window can ask of the desktop around it. */
export interface Shell {
  open(id: AppId, args?: LaunchArgs): void;
  close(id: AppId): void;
  /**
   * Shows a system message box, replacing any message already showing.
   * An 'error' plays the error sound; 'info' (an About box, a help tip) is silent.
   */
  showDialog(title: string, message: string, icon?: string, kind?: 'error' | 'info'): void;
  /** Names what the window is showing, in its title bar and taskbar button. */
  setCaption(id: AppId, caption: string, icon?: string): void;
  dialog: SystemDialog;
  recycleEmpty: boolean;
  emptyRecycleBin(): void;
}

/** Props every app window body receives. */
export interface AppProps {
  id: AppId;
  launch?: Launch;
}

/** Start > Help and Support (and Help in each app): the Welcome window, with how to find your way around. */
export const showHelpAndSupport = (shell: Pick<Shell, 'open'>) => shell.open('welcome');

/** Help > About for an app: a silent message box naming it. */
export const showAbout = (shell: Pick<Shell, 'showDialog'>, appName: string, icon: string) =>
  shell.showDialog(`About ${appName}`, `${appName}\nPart of the Windows XP desktop portfolio.`, icon, 'info');

export const ShellContext = createContext<Shell | null>(null);

export const useShell = (): Shell => {
  const shell = useContext(ShellContext);
  if (!shell) throw new Error('App windows must be rendered inside the desktop shell');
  return shell;
};
