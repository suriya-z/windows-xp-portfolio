import { useEffect, useState, type RefObject } from 'react';
import { SafeIcon } from '../components/SafeIcon';
import XPLogo from '../components/XPLogo';
import { QUICK_LAUNCH, appById, appIcon, type AppId } from '../os/apps';
import type { WindowState } from '../types/os';

/** The taskbar clock: "6:07 PM". */
const clockTime = (d = new Date()) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

/** The Luna taskbar: Start button, Quick Launch, a button per open window, and the notification area. */
export default function Taskbar({
  windows,
  activeId,
  recycleEmpty,
  startOpen,
  startButtonRef,
  volumeOn,
  onStartClick,
  onShowDesktop,
  onOpen,
  onTaskClick,
  onToggleVolume,
}: {
  windows: WindowState[];
  activeId: string | null;
  recycleEmpty: boolean;
  startOpen: boolean;
  startButtonRef: RefObject<HTMLButtonElement>;
  volumeOn: boolean;
  onStartClick: () => void;
  onShowDesktop: () => void;
  onOpen: (id: AppId) => void;
  onTaskClick: (id: string) => void;
  onToggleVolume: () => void;
}) {
  // The clock keeps its own time, so its ticking redraws only the taskbar.
  const [time, setTime] = useState(clockTime);
  useEffect(() => {
    const timer = setInterval(() => setTime(clockTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="h-[30px] xp-taskbar-bg px-0 flex items-center justify-between z-50 select-none relative shadow-[0_-2px_4px_rgba(0,0,0,0.3)]">

      <div className="flex items-center h-full">
        {/* Glossy Green Luna Start Button */}
        <button
          ref={startButtonRef}
          aria-haspopup="menu"
          aria-expanded={startOpen}
          onClick={(e) => {
      e.stopPropagation();
      onStartClick();
    }}
          className="h-full px-3 rounded-r-[15px] xp-start-btn flex items-center space-x-1.5 cursor-pointer z-50 mr-1.5 select-none"
        >
          <XPLogo className="w-[19px] h-[17px] select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] flex-shrink-0" />
          <span className="text-white text-xp-start font-black italic tracking-tighter select-none font-sans drop-shadow-[1px_1.5px_1px_rgba(0,0,0,0.85)]">
            start
          </span>
        </button>

        {/* Quick Launch Icons Bar */}
        <div className="hidden sm:flex items-center space-x-0.5 px-0.5 border-r border-[#1647a8] h-[80%] mr-1">
          <div className="xp-toolbar-grip"></div>
          <button
            onClick={onShowDesktop}
            title="Show Desktop"
            className="w-6 h-6 hover:bg-white/20 rounded-xs flex items-center justify-center transition-colors cursor-pointer"
          >
            <SafeIcon src="/assets/xp-icons/Desktop.png" className="w-4 h-4 object-contain drop-shadow-sm" size={16} alt="Show Desktop" />
          </button>
          {QUICK_LAUNCH.map((id) => (
            <button
              key={id}
              onClick={() => onOpen(id)}
              title={appById(id).title}
              className="w-6 h-6 hover:bg-white/20 rounded-xs flex items-center justify-center transition-colors cursor-pointer"
            >
              <SafeIcon src={appIcon(id)} className="w-4 h-4 object-contain drop-shadow-sm" size={16} alt={appById(id).title} />
            </button>
          ))}
        </div>
      </div>

      {/* Open Task Buttons Area */}
      <div className="flex-1 flex items-center space-x-1 overflow-x-auto win1-scrollbar py-0.5 px-1 h-full select-none" style={{ scrollbarWidth: 'none' }}>
        <div className="xp-toolbar-grip mr-0.5 hidden sm:block"></div>
        {windows.map((win) => {
          if (!win.isOpen) return null;
          const isFocused = activeId === win.id && !win.isMinimized;
          const currentLabel = (win.caption ?? win.title);

          const taskIcon = (
            <SafeIcon
              src={win.captionIcon ?? appIcon(win.id, { recycleEmpty: recycleEmpty })}
              className="w-4 h-4 object-contain flex-shrink-0"
              size={16}
              alt=""
            />
          );

          return (
            <button
              key={win.id}
              onClick={() => onTaskClick(win.id)}
              aria-pressed={isFocused}
              data-task-id={win.id}
              className={`h-[25px] max-w-[160px] min-w-[36px] sm:min-w-[110px] px-2 rounded-[2px] flex items-center space-x-1.5 cursor-pointer text-xp-body font-sans truncate transition-colors ${
                isFocused ? 'xp-taskbar-item-active text-white font-semibold' : 'xp-taskbar-item text-white/95'
              }`}
            >
              <span className="flex-shrink-0">{taskIcon}</span>
              <span className="truncate text-left leading-none [text-shadow:1px_1px_1px_rgba(0,0,0,0.5)]">{currentLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Notification / System Tray area matching Windows XP Luna */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-full px-2 flex items-center space-x-1.5 xp-system-tray select-none text-right"
      >
        {/* Hidden Icons Toggle Chevron Pill */}
        <button
          title="Show hidden icons"
          className="w-3.5 h-3.5 rounded-full bg-[#186be0] hover:bg-[#2c7cf0] border border-[#0d4692] flex items-center justify-center text-white text-xp-glyph font-bold cursor-pointer mr-0.5 select-none shadow-xs"
        >
          &lt;
        </button>

        <div className="flex items-center space-x-1.5 pr-1.5 border-r border-[#195bc7]/60">
          <SafeIcon
            src="/assets/xp-icons/Network Connection.png"
            className="w-3.5 h-3.5 object-contain"
            size={14}
            alt="Network"
            title="Local Area Connection&#10;Speed: 100.0 Mbps&#10;Status: Connected"
          />
          <SafeIcon
            src="/assets/xp-icons/Security Center.png"
            className="w-3.5 h-3.5 object-contain"
            size={14}
            alt="Security"
            title="Windows Security Alerts"
          />
          <button
            onClick={onToggleVolume}
            title={volumeOn ? 'Volume' : 'Mute'}
            aria-label="Mute"
            aria-pressed={!volumeOn}
            className="flex items-center cursor-pointer"
          >
            <SafeIcon src="/assets/xp-icons/Volume.png" className="w-3.5 h-3.5 object-contain" size={14} alt="" />
          </button>
        </div>

        {/* Digital Clock with Full Date Tooltip */}
        <span
          className="text-xp-body font-sans tracking-tight text-white select-none pr-0.5 leading-none cursor-default"
          title={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        >
          {time}
        </span>
      </div>
    </footer>
  );
}
