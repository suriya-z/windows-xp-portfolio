import React, { useEffect, useRef, useState } from 'react';
import { SafeIcon } from '../components/SafeIcon';
import { ALL_PROGRAMS, START_MENU_PROGRAMS, appIcon, menuLabel } from '../os/apps';
import { profile } from '../os/profile';
import { showHelpAndSupport, useShell } from '../os/shell';
import { sound } from '../os/sound';

/** The two-column XP Start menu with its All Programs, My Recent Documents and Connect To flyouts. */
export default function StartMenu({
  onClose,
  onLogOff,
  onTurnOff,
}: {
  onClose: () => void;
  onLogOff: () => void;
  onTurnOff: () => void;
}) {
  const shell = useShell();
  const [isRecentDocsOpen, setIsRecentDocsOpen] = useState(false);
  const [isConnectToOpen, setIsConnectToOpen] = useState(false);
  const [isAllProgramsOpen, setIsAllProgramsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Opening the menu puts the keyboard on its first entry; Up and Down walk the entries, as in Windows.
  useEffect(() => {
    (panelRef.current?.querySelector('button') as HTMLElement | null)?.focus();
  }, []);

  const moveWithArrows = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const entries = [...e.currentTarget.querySelectorAll('button')] as HTMLElement[];
    const at = entries.indexOf(document.activeElement as HTMLElement);
    const step = e.key === 'ArrowDown' ? 1 : -1;
    entries[(at + step + entries.length) % entries.length]?.focus();
    e.preventDefault();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseLeave={() => {
        setIsRecentDocsOpen(false);
        setIsConnectToOpen(false);
        setIsAllProgramsOpen(false);
      }}
      ref={panelRef}
      role="dialog"
      aria-label="Start menu"
      onKeyDown={moveWithArrows}
      className="absolute bottom-11 left-0 w-[420px] max-w-full bg-[#003399] rounded-t-lg shadow-2xl border-2 border-[#003399] flex flex-col z-[100] overflow-visible xp-start-menu-open"
      style={{
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
    >
      {/* Start Menu Header */}
      <div className="h-16 bg-gradient-to-r from-[#003399] to-[#6487DC] p-2 flex items-center justify-between border-b-2 border-[#e18e14]">
        {/* User Avatar & Name */}
        <div className="flex items-center space-x-3 pl-1">
          <div className="w-11 h-11 bg-[#6487DC] p-[1.5px] rounded border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
            <SafeIcon
              src="/assets/xp-icons/User Accounts.png"
              className="w-full h-full object-contain rounded bg-[#3a6ea5] p-0.5"
              size={40}
              alt=""
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-sm font-bold tracking-wide drop-shadow-[1px_1.5px_1px_rgba(0,0,0,0.85)] font-sans">{profile.name}</span>
          </div>
        </div>
      </div>

      {/* Start Menu Main Content Panels */}
      <div className="flex bg-[#6487DC]/15 border-b border-[#6487DC]/30 relative" style={{ minHeight: '380px' }}>

        {/* Left Column (White programs) */}
        <div className="w-[53%] bg-white p-1.5 flex flex-col justify-between border-r border-[#6487DC]/30">
          <div className="flex flex-col space-y-1">

            {/* Top Pin: Internet */}
            <button
              onClick={() => {
                shell.open('internet_explorer');
                onClose();
              }}
              onMouseEnter={() => {
                setIsRecentDocsOpen(false);
                setIsConnectToOpen(false);
                setIsAllProgramsOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded flex items-center space-x-2.5 hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
            >
              <SafeIcon src={appIcon('internet_explorer')} className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
              <div className="flex flex-col">
                <span className="font-bold text-xp-body text-black group-hover:text-white">Internet</span>
                <span className="text-xp-caption text-gray-400 group-hover:text-white/80 leading-none">Internet Explorer</span>
              </div>
            </button>

            {/* Top Pin: Email */}
            <button
              onClick={() => {
                shell.open('contact');
                onClose();
              }}
              onMouseEnter={() => {
                setIsRecentDocsOpen(false);
                setIsConnectToOpen(false);
                setIsAllProgramsOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded flex items-center space-x-2.5 hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
            >
              <SafeIcon src={appIcon('contact')} className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
              <div className="flex flex-col">
                <span className="font-bold text-xp-body text-black group-hover:text-white">E-mail</span>
                <span className="text-xp-caption text-gray-400 group-hover:text-white/80 leading-none">Contact Suriya</span>
              </div>
            </button>

            {/* Separator line */}
            <div className="h-[1px] bg-neutral-200 my-1 mx-1.5"></div>

            {/* Other programs list */}
            {START_MENU_PROGRAMS.map((launcher) => (
              <button
                key={launcher.label}
                  onClick={() => {
                  shell.open(launcher.opens, launcher.file ? { file: launcher.file } : undefined);
                  onClose();
                }}
                onMouseEnter={() => {
                  setIsRecentDocsOpen(false);
                  setIsConnectToOpen(false);
                  setIsAllProgramsOpen(false);
                }}
                className="w-full text-left px-2 py-1 rounded flex items-center space-x-2.5 hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
              >
                <SafeIcon src={appIcon(launcher.opens)} className="w-6 h-6 object-contain flex-shrink-0 group-hover:scale-105 transition-transform" size={24} alt="" />
                <span className="font-bold text-xp-body text-neutral-800 group-hover:text-white">{launcher.label}</span>
              </button>
            ))}

          </div>

          {/* All Programs trigger at bottom */}
          <div className="pt-1.5 border-t border-neutral-200 mt-1">
            <button
              onMouseEnter={() => {
                setIsAllProgramsOpen(true);
                setIsRecentDocsOpen(false);
                setIsConnectToOpen(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded flex items-center justify-between hover:bg-[#316ac5] hover:text-white transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#4bb827] to-[#256a12] border border-[#1b520d] flex items-center justify-center text-white text-xp-caption font-bold shadow-xs">
                  ▶
                </div>
                <span className="font-bold text-xp-menu text-black group-hover:text-white font-sans">All Programs</span>
              </div>
              <span className="text-xp-caption text-gray-500 group-hover:text-white font-sans pr-1">▶</span>
            </button>
          </div>

        </div>

        {/* Right Column (Light blue system features) */}
        <div className="w-[47%] bg-[#d3e5fe] p-1.5 flex flex-col justify-between border-l border-[#6487dc]/30">
          <div className="flex flex-col space-y-1">

            {/* My Documents */}
            <button
              onClick={() => {
                shell.open('my_documents');
                onClose();
              }}
              onMouseEnter={() => {
                setIsRecentDocsOpen(false);
                setIsConnectToOpen(false);
                setIsAllProgramsOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded flex items-center space-x-2 hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
            >
              <SafeIcon src={appIcon('my_documents')} className="w-6 h-6 object-contain flex-shrink-0" size={24} alt="" />
              <span className="font-bold text-xp-body text-[#003399] group-hover:text-white">My Documents</span>
            </button>

            {/* My Recent Documents */}
            <div className="relative">
              <button
                onMouseEnter={() => {
                  setIsRecentDocsOpen(true);
                  setIsConnectToOpen(false);
                  setIsAllProgramsOpen(false);
                }}
                className="w-full text-left px-2 py-1 rounded flex items-center justify-between hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon src={'/assets/xp-icons/Recent Documents.png'} className="w-6 h-6 object-contain flex-shrink-0" size={24} alt="" />
                  <span className="font-bold text-xp-body text-[#003399] group-hover:text-white">My Recent Documents</span>
                </div>
                <span className="text-xp-micro text-[#003399] group-hover:text-white font-sans">▶</span>
              </button>
            </div>

            {/* My Pictures */}
            <button
              onClick={() => {
                shell.open('paint');
                onClose();
              }}
              onMouseEnter={() => {
                setIsRecentDocsOpen(false);
                setIsConnectToOpen(false);
                setIsAllProgramsOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded flex items-center space-x-2 hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
            >
              <SafeIcon src={'/assets/xp-icons/My Pictures.png'} className="w-6 h-6 object-contain flex-shrink-0" size={24} alt="" />
              <span className="font-bold text-xp-body text-[#003399] group-hover:text-white">My Pictures</span>
            </button>

            {/* My Music */}
            <button
              onClick={() => {
                sound.tune([
                  { freq: 440, ms: 100, wave: 'sine', at: 0 },
                  { freq: 554, ms: 100, wave: 'sine', at: 100 },
                  { freq: 659, ms: 150, wave: 'sine', at: 200 },
                ]);
                shell.open('clock');
                onClose();
              }}
              onMouseEnter={() => {
                setIsRecentDocsOpen(false);
                setIsConnectToOpen(false);
                setIsAllProgramsOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded flex items-center space-x-2 hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
            >
              <SafeIcon src={'/assets/xp-icons/My Music.png'} className="w-6 h-6 object-contain flex-shrink-0" size={24} alt="" />
              <span className="font-bold text-xp-body text-[#003399] group-hover:text-white">My Music</span>
            </button>

            {/* My Computer */}
            <button
              onClick={() => {
                shell.open('my_computer');
                onClose();
              }}
              onMouseEnter={() => {
                setIsRecentDocsOpen(false);
                setIsConnectToOpen(false);
                setIsAllProgramsOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded flex items-center space-x-2 hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
            >
              <SafeIcon src={appIcon('my_computer')} className="w-6 h-6 object-contain flex-shrink-0" size={24} alt="" />
              <span className="font-bold text-xp-body text-[#003399] group-hover:text-white">My Computer</span>
            </button>

            {/* Separator line */}
            <div className="h-[1px] bg-[#6487DC]/30 my-1 mx-1.5 shadow-[0_1px_0_rgba(255,255,255,0.5)]"></div>

            {/* Control Panel */}
            <button
              onClick={() => {
                shell.open('control');
                onClose();
              }}
              onMouseEnter={() => {
                setIsRecentDocsOpen(false);
                setIsConnectToOpen(false);
                setIsAllProgramsOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded flex items-center space-x-2 hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
            >
              <SafeIcon src={appIcon('control')} className="w-6 h-6 object-contain flex-shrink-0" size={24} alt="" />
              <span className="font-bold text-xp-body text-[#003399] group-hover:text-white">Control Panel</span>
            </button>

            {/* Set Program Access */}
            <button
              onClick={() => {
                shell.open('control');
                onClose();
              }}
              onMouseEnter={() => {
                setIsRecentDocsOpen(false);
                setIsConnectToOpen(false);
                setIsAllProgramsOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded flex items-center space-x-2 hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
            >
              <SafeIcon src={'/assets/xp-icons/Default Programs.png'} className="w-6 h-6 object-contain flex-shrink-0" size={24} alt="" />
              <span className="font-bold text-xp-body text-[#003399] group-hover:text-white">Set Program Access</span>
            </button>

            {/* Connect To */}
            <div className="relative">
              <button
                onMouseEnter={() => {
                  setIsConnectToOpen(true);
                  setIsRecentDocsOpen(false);
                  setIsAllProgramsOpen(false);
                }}
                className="w-full text-left px-2 py-1 rounded flex items-center justify-between hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon src={'/assets/xp-icons/Network Connections.png'} className="w-6 h-6 object-contain flex-shrink-0" size={24} alt="" />
                  <span className="font-bold text-xp-body text-[#003399] group-hover:text-white">Connect To</span>
                </div>
                <span className="text-xp-micro text-[#003399] group-hover:text-white font-sans">▶</span>
              </button>
            </div>

            {/* Separator line */}
            <div className="h-[1px] bg-[#6487DC]/30 my-1 mx-1.5 shadow-[0_1px_0_rgba(255,255,255,0.5)]"></div>

            {/* Help and Support */}
            <button
              onClick={() => {
                showHelpAndSupport(shell);
                onClose();
              }}
              onMouseEnter={() => {
                setIsRecentDocsOpen(false);
                setIsConnectToOpen(false);
                setIsAllProgramsOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded flex items-center space-x-2 hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
            >
              <SafeIcon src={'/assets/xp-icons/Help and Support.png'} className="w-6 h-6 object-contain flex-shrink-0" size={24} alt="" />
              <span className="font-bold text-xp-body text-[#003399] group-hover:text-white">Help and Support</span>
            </button>

            {/* Search */}
            <button
              onClick={() => {
                shell.open('internet_explorer', { url: 'http://google.com' });
                onClose();
              }}
              onMouseEnter={() => {
                setIsRecentDocsOpen(false);
                setIsConnectToOpen(false);
                setIsAllProgramsOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded flex items-center space-x-2 hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
            >
              <SafeIcon src={'/assets/xp-icons/Search.png'} className="w-6 h-6 object-contain flex-shrink-0" size={24} alt="" />
              <span className="font-bold text-xp-body text-[#003399] group-hover:text-white">Search</span>
            </button>

            {/* Run... */}
            <button
              onClick={() => {
                shell.open('run_cmd');
                onClose();
              }}
              onMouseEnter={() => {
                setIsRecentDocsOpen(false);
                setIsConnectToOpen(false);
                setIsAllProgramsOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded flex items-center space-x-2 hover:bg-[#003399] hover:text-white transition-colors cursor-pointer group"
            >
              <SafeIcon src={'/assets/xp-icons/Run.png'} className="w-6 h-6 object-contain flex-shrink-0" size={24} alt="" />
              <span className="font-bold text-xp-body text-[#003399] group-hover:text-white font-sans">Run...</span>
            </button>

          </div>
        </div>

        {/* === ALL PROGRAMS FLYOUT === */}
        {isAllProgramsOpen && (
          <div
            className="absolute left-[200px] bottom-0 w-[210px] bg-white border-2 border-[#003399] shadow-2xl z-[110] flex flex-col p-1 space-y-0.5 rounded"
            onMouseEnter={() => setIsAllProgramsOpen(true)}
          >
            <div className="text-xp-caption font-bold text-[#003399] px-2 py-1 border-b border-neutral-100 uppercase tracking-wider select-none">
              All Programs
            </div>
            {ALL_PROGRAMS.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  shell.open(app.id);
                  onClose();
                  setIsAllProgramsOpen(false);
                }}
                className="w-full text-left px-2.5 py-1 rounded flex items-center space-x-2 hover:bg-[#003399] hover:text-white cursor-pointer group"
              >
                <SafeIcon src={appIcon(app.id, { recycleEmpty: shell.recycleEmpty })} className="w-5 h-5 object-contain flex-shrink-0" size={20} alt="" />
                <span className="font-bold text-xp-body text-neutral-800 group-hover:text-white">{menuLabel(app)}</span>
              </button>
            ))}
          </div>
        )}

        {/* === MY RECENT DOCUMENTS FLYOUT === */}
        {isRecentDocsOpen && (
          <div
            className="absolute left-[390px] top-[40px] w-[180px] bg-white border-2 border-[#003399] shadow-2xl z-[110] flex flex-col p-1 space-y-0.5 rounded"
            onMouseEnter={() => setIsRecentDocsOpen(true)}
          >
            <div className="text-xp-caption font-bold text-gray-400 px-2.5 py-1 border-b border-neutral-100 uppercase tracking-wider select-none">
              Recent Files
            </div>
            {Object.keys(profile.files).map((name, idx) => (
              <button
                key={idx}
                onClick={() => {
                  shell.open('notepad', { file: name });
                  onClose();
                  setIsRecentDocsOpen(false);
                }}
                className="w-full text-left px-2.5 py-1 rounded flex items-center space-x-2 hover:bg-[#003399] hover:text-white cursor-pointer group"
              >
                <SafeIcon src="/assets/xp-icons/Notepad.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" />
                <span className="font-bold text-xp-body text-neutral-800 group-hover:text-white">{name}</span>
              </button>
            ))}
          </div>
        )}

        {/* === CONNECT TO FLYOUT === */}
        {isConnectToOpen && (
          <div
            className="absolute left-[390px] top-[200px] w-[200px] bg-white border-2 border-[#003399] shadow-2xl z-[110] flex flex-col p-1 space-y-0.5 rounded"
            onMouseEnter={() => setIsConnectToOpen(true)}
          >
            <div className="text-xp-caption font-bold text-gray-400 px-2.5 py-1 border-b border-neutral-100 uppercase tracking-wider select-none">
              Network Connections
            </div>
            {[
              { title: 'MSN Dial-up Service', desc: '56 Kbps standard dialup' },
              { title: 'Suriya Neural VPN', desc: 'High-speed secure connection' }
            ].map((net, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sound.tune([
                    { freq: 300, ms: 300, wave: 'sawtooth', at: 0 },
                    { freq: 500, ms: 200, wave: 'square', at: 300 },
                  ]);
                  shell.open('internet_explorer');
                  onClose();
                  setIsConnectToOpen(false);
                }}
                className="w-full text-left px-2.5 py-1 rounded flex flex-col hover:bg-[#003399] hover:text-white cursor-pointer group"
              >
                <span className="font-bold text-xp-body text-neutral-800 group-hover:text-white">{net.title}</span>
                <span className="text-xp-micro text-gray-400 group-hover:text-white/80 leading-none mt-0.5">{net.desc}</span>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Start Menu Footer */}
      <div className="h-12 bg-gradient-to-r from-[#003399] to-[#6487DC] p-1.5 px-3 flex justify-end items-center space-x-4 border-t border-[#6487DC]/30">
        {/* Log Off */}
        <button
          onClick={() => {
            sound.play('shutdown');
            onClose();
            onLogOff();
          }}
          className="flex items-center space-x-2 text-white hover:brightness-110 active:brightness-90 select-none cursor-pointer group"
        >
          <SafeIcon src="/assets/xp-icons/Logout.png" className="w-6 h-6 object-contain" size={24} alt="" />
          <span className="text-xp-body font-bold font-sans leading-none text-shadow-sm shadow-black">Log Off</span>
        </button>

        {/* Turn Off Computer */}
        <button
          onClick={() => {
            sound.play('shutdown');
            onClose();
            onTurnOff();
          }}
          className="flex items-center space-x-2 text-white hover:brightness-110 active:brightness-90 select-none cursor-pointer group"
        >
          <SafeIcon src="/assets/xp-icons/Power.png" className="w-6 h-6 object-contain" size={24} alt="" />
          <span className="text-xp-body font-bold font-sans leading-none text-shadow-sm shadow-black">Turn Off Computer</span>
        </button>
      </div>

    </div>
  );
}
