/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { APP_WINDOWS, preloadAllApps } from './apps';
import BootScreen from './desktop/BootScreen';
import Desktop from './desktop/Desktop';
import LoginScreen from './desktop/LoginScreen';
import StartMenu from './desktop/StartMenu';
import Taskbar from './desktop/Taskbar';
import { WindowFrame, type MinimizeTarget } from './desktop/WindowFrame';
import { appById, appIcon, type AppId, type DesktopShortcut } from './os/apps';
import { profile } from './os/profile';
import { ShellContext, type Launch, type LaunchArgs, type Shell, type SystemDialog } from './os/shell';
import { sound } from './os/sound';
import {
  BOOT_ASSETS,
  BOOT_MAX_MS,
  BOOT_MIN_MS,
  hasLoggedOnBefore,
  preloadImages,
  prefersReducedMotion,
  rememberLogOn,
} from './os/startup';
import { useWindowManager } from './os/useWindowManager';
import { isCompact } from './os/windowPlacement';

const LOG_ON_MS = 1500;
const AFTER_CLOSE = 'after-close';

/** The desktop shell: boot and log-on, then the desktop, its windows, the Start menu and the taskbar. */
export default function App() {
  // A returning visitor goes straight to the desktop; reduced motion skips the boot screen.
  const [returning] = useState(hasLoggedOnBefore);
  const [isBooting, setIsBooting] = useState(() => !returning && !prefersReducedMotion());
  const [showLogin, setShowLogin] = useState(!returning);
  const [isLoggingOn, setIsLoggingOn] = useState(false);
  const [volumeOn, setVolumeOn] = useState(true);
  useEffect(() => sound.setMuted(!volumeOn), [volumeOn]);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [recycleEmpty, setRecycleEmpty] = useState(false);

  // The system message box, and what each app was last opened with
  const [dialog, setDialog] = useState<SystemDialog>({
    title: 'Windows XP',
    message: '',
    icon: '/assets/xp-icons/Help and Support.png',
  });
  const [launches, setLaunches] = useState<Partial<Record<AppId, Launch>>>({});

  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const compact = isCompact(viewport);
  const wm = useWindowManager(viewport);
  const { windows, activeId } = wm;

  const startButtonRef = useRef<HTMLButtonElement>(null);
  /** Where keyboard focus goes after the next render: into a window being opened, or on from one just closed. */
  const pendingFocusRef = useRef<string | null>(null);
  /** Where each minimizing window shrinks to: its taskbar button. */
  const minimizeTargets = useRef<Record<string, MinimizeTarget>>({});

  // The boot screen lasts as long as the desktop takes to load (within limits), and any key skips it.
  useEffect(() => {
    if (!isBooting) return;
    // A quick floppy-drive chirp as the machine starts.
    sound.tune([
      { freq: 330, ms: 30, wave: 'triangle', at: 200 },
      { freq: 440, ms: 30, wave: 'triangle', at: 320 },
    ]);
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setIsBooting(false);
    };
    const started = Date.now();
    let shownLongEnough: ReturnType<typeof setTimeout> | undefined;
    preloadImages(BOOT_ASSETS).then(() => {
      if (!finished) shownLongEnough = setTimeout(finish, Math.max(0, BOOT_MIN_MS - (Date.now() - started)));
    });
    const tooSlow = setTimeout(finish, BOOT_MAX_MS);
    window.addEventListener('keydown', finish);
    return () => {
      finished = true;
      clearTimeout(tooSlow);
      clearTimeout(shownLongEnough);
      window.removeEventListener('keydown', finish);
    };
  }, [isBooting]);

  // Once the desktop is up, fetch the rest of the apps in the background so they open instantly.
  const onDesktop = !isBooting && !showLogin;
  useEffect(() => {
    if (!onDesktop) return;
    const timer = setTimeout(() => void preloadAllApps(), 1000);
    return () => clearTimeout(timer);
  }, [onDesktop]);

  // Keyboard focus follows windows as they open and close.
  useEffect(() => {
    const target = pendingFocusRef.current;
    if (!target) return;
    pendingFocusRef.current = null;
    const id = target === AFTER_CLOSE ? activeId : target;
    const frame = id ? (document.querySelector(`[data-window-id="${id}"]`) as HTMLElement | null) : null;
    if (!frame) {
      startButtonRef.current?.focus();
      return;
    }
    if (frame.contains(document.activeElement)) return;
    // The window's default button, else the first place to type, else the window itself.
    const first = frame.querySelector(
      '[data-autofocus], [data-window-body] input:not([disabled]), [data-window-body] textarea',
    ) as HTMLElement | null;
    (first ?? frame).focus();
  });

  // A resized browser keeps every window and icon reachable.
  useEffect(() => {
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => wm.fit(viewport), [viewport.width, viewport.height]);

  const openWindow = useCallback((id: AppId, args?: LaunchArgs) => {
    pendingFocusRef.current = id;
    sound.play('restore');
    if (args) setLaunches((prev) => ({ ...prev, [id]: { ...args, seq: (prev[id]?.seq ?? 0) + 1 } }));
    wm.open(id);
  }, []);

  const closeWindow = useCallback((id: string) => {
    pendingFocusRef.current = AFTER_CLOSE;
    sound.play('click');
    wm.close(id);
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    const frame = document.querySelector(`[data-window-id="${id}"]`)?.getBoundingClientRect();
    const button = document.querySelector(`[data-task-id="${id}"]`)?.getBoundingClientRect();
    if (frame && button && frame.width > 0) {
      minimizeTargets.current[id] = {
        dx: button.left + button.width / 2 - (frame.left + frame.width / 2),
        dy: button.top + button.height / 2 - (frame.top + frame.height / 2),
      };
    }
    sound.play('minimize');
    wm.minimize(id);
  }, []);

  const restoreWindow = useCallback((id: string) => {
    pendingFocusRef.current = id;
    sound.play('restore');
    wm.restore(id);
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    sound.play('click');
    wm.toggleMaximize(id);
  }, []);

  /** A taskbar button: minimizes its window when it is the active one, else brings it up. */
  const pressTask = (id: string) => {
    const win = windows.find((w) => w.id === id);
    if (!win) return;
    if (activeId === id && !win.isMinimized) minimizeWindow(id);
    else if (win.isMinimized) restoreWindow(id);
    else {
      pendingFocusRef.current = id;
      wm.focus(id);
    }
  };

  const showSystemDialog = (
    title: string,
    message: string,
    icon = '/assets/xp-icons/Help and Support.png',
    kind: 'error' | 'info' = 'error',
  ) => {
    if (kind === 'error') sound.play('error');
    pendingFocusRef.current = 'error_dialog';
    setDialog({ title, message, icon });
    wm.open('error_dialog');
    wm.setCaption('error_dialog', title);
  };

  // Escape closes the Start menu, else cancels a message box or Run, as in Windows.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (isStartMenuOpen) {
        setIsStartMenuOpen(false);
        startButtonRef.current?.focus();
      } else if (activeId === 'error_dialog' || activeId === 'run_cmd') {
        closeWindow(activeId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isStartMenuOpen, activeId]);

  const logOn = () => {
    if (isLoggingOn) return;
    setIsLoggingOn(true);
    sound.play('startup');
    setTimeout(() => {
      // A first-time visitor gets the Welcome window, with the way to the resume, projects and contact.
      if (!hasLoggedOnBefore()) openWindow('welcome');
      setShowLogin(false);
      setIsLoggingOn(false);
      rememberLogOn();
    }, LOG_ON_MS);
  };

  const restart = () => {
    sound.tune([
      { freq: 440, ms: 60, wave: 'square', at: 0 },
      { freq: 220, ms: 100, wave: 'square', at: 60 },
    ]);
    setIsBooting(true);
    setShowLogin(true);
    setIsLoggingOn(false);
  };

  // One shell object per change of what it exposes, so app windows re-render only when it matters to them.
  const shell: Shell = useMemo(
    () => ({
      open: openWindow,
      close: closeWindow,
      showDialog: showSystemDialog,
      setCaption: wm.setCaption,
      dialog,
      recycleEmpty,
      emptyRecycleBin: () => {
        if (recycleEmpty) return;
        setRecycleEmpty(true);
        sound.play('recycle');
      },
    }),
    [dialog, recycleEmpty],
  );

  return (
    <ShellContext.Provider value={shell}>
      <div
        className="h-screen w-screen flex flex-col select-none text-sm overflow-hidden bg-black"
        style={{ fontFamily: "'Tahoma', 'Segoe UI', Arial, sans-serif" }}
      >
        {isBooting && (
          <BootScreen
            onSkip={() => {
              setIsBooting(false);
              setShowLogin(true);
            }}
          />
        )}

        {!isBooting && showLogin && <LoginScreen isLoggingOn={isLoggingOn} onLogOn={logOn} onRestart={restart} />}

        {!isBooting && !showLogin && (
          <div className="flex-1 flex flex-col relative w-full h-full xp-wallpaper select-none">
            <h1 className="sr-only">
              {profile.name}, {profile.role}: Windows XP desktop portfolio
            </h1>

            <main
              // Any press on the desktop or a window closes the Start menu.
              onPointerDownCapture={() => setIsStartMenuOpen(false)}
              className="flex-1 relative overflow-hidden select-none"
              style={{ minHeight: 0 }}
            >
              <Desktop
                viewport={viewport}
                compact={compact}
                recycleEmpty={recycleEmpty}
                onOpen={(shortcut: DesktopShortcut) =>
                  openWindow(shortcut.opens, shortcut.file ? { file: shortcut.file } : undefined)
                }
                onPress={wm.blur}
                onProperties={() => openWindow('control')}
              />

              {windows.map((win) => {
                if (!win.isOpen) return null;
                return (
                  <WindowFrame
                    key={win.id}
                    win={win}
                    title={win.caption ?? win.title}
                    icon={win.captionIcon ?? appIcon(win.id, { recycleEmpty })}
                    viewport={viewport}
                    isActive={activeId === win.id}
                    flush={!!appById(win.id).flush}
                    minimizeTo={minimizeTargets.current[win.id]}
                    onFocus={wm.focus}
                    onMinimize={minimizeWindow}
                    onMaximize={maximizeWindow}
                    onClose={closeWindow}
                    onMove={wm.move}
                    onResize={wm.resize}
                    body={APP_WINDOWS[win.id as AppId]}
                    launch={launches[win.id as AppId]}
                  />
                );
              })}
            </main>

            {isStartMenuOpen && (
              <StartMenu
                onClose={() => setIsStartMenuOpen(false)}
                onLogOff={() => setShowLogin(true)}
                onTurnOff={() => {
                  setIsBooting(true);
                  setShowLogin(true);
                }}
              />
            )}

            <Taskbar
              windows={windows}
              activeId={activeId}
              recycleEmpty={recycleEmpty}
              startOpen={isStartMenuOpen}
              startButtonRef={startButtonRef}
              volumeOn={volumeOn}
              onStartClick={() => {
                setIsStartMenuOpen((open) => !open);
                sound.play('click');
              }}
              onShowDesktop={() => {
                sound.play('minimize');
                wm.showDesktop();
              }}
              onOpen={(id) => openWindow(id)}
              onTaskClick={pressTask}
              onToggleVolume={() => setVolumeOn((on) => !on)}
            />
          </div>
        )}
      </div>
    </ShellContext.Provider>
  );
}
