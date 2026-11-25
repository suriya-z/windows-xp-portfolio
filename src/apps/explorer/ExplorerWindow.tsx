import { useEffect, useState } from 'react';
import { MenuBar } from '../../components/MenuBar';
import { SafeIcon } from '../../components/SafeIcon';
import XPLogo from '../../components/XPLogo';
import { appIcon } from '../../os/apps';
import { profile } from '../../os/profile';
import { back, canGoBack, canGoForward, current, forward, go, startHistory } from '../../os/history';
import { sound } from '../../os/sound';
import { showAbout, showHelpAndSupport, useShell, type AppProps } from '../../os/shell';

/** Where each Explorer window starts. */
const START_PLACE: Record<string, string> = {
  my_computer: 'My Computer',
  my_documents: 'My Documents',
  control: 'Control Panel',
};

const PLACE_ICONS: Record<string, string> = {
  'My Computer': '/assets/xp-icons/My Computer.png',
  'My Documents': '/assets/xp-icons/My Documents.png',
  'Control Panel': '/assets/xp-icons/Control Panel.png',
  'Local Disk (C:)': '/assets/xp-icons/Local Disk.png',
  'My Music': '/assets/xp-icons/My Music.png',
  'My Pictures': '/assets/xp-icons/My Pictures.png',
};
const getIconForPath = (place: string) => PLACE_ICONS[place] ?? '/assets/xp-icons/Folder Closed.png';

/** Places with a parent folder that Up can go to. */
const INSIDE_MY_COMPUTER = ['My Music', 'My Pictures', 'Local Disk (C:)'];

/** Windows Explorer: My Computer, My Documents and Control Panel, with Back, Forward and Up. */
export default function ExplorerWindow({ id }: AppProps) {
  const shell = useShell();
  const [history, setHistory] = useState(() => startHistory(START_PLACE[id] ?? 'My Computer'));
  const currentLoc = current<string>(history);
  const navigate = (place: string) => setHistory((h) => go(h, place));
  const goUp = () => {
    if (INSIDE_MY_COMPUTER.includes(currentLoc)) navigate('My Computer');
  };

  useEffect(() => shell.setCaption(id, currentLoc, getIconForPath(currentLoc)), [currentLoc]);

  // Left pane collapsing states
  const isMyComputer = currentLoc === 'My Computer' || currentLoc === 'Local Disk (C:)';
  const isControlPanel = currentLoc === 'Control Panel';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f1f1e3] text-black select-none font-sans text-xs">
      {/* 1. MENU BAR */}
      <MenuBar
        className="bg-[#f6f6ef] border-b border-[#dedede] text-xp-body"
        menus={[
          { label: 'File', items: [{ label: 'Close', onSelect: () => shell.close(id) }] },
          { label: 'Edit', items: [{ label: 'Undo' }, 'separator', { label: 'Select All' }] },
          { label: 'View', items: [{ label: 'Tiles' }, { label: 'Icons' }, { label: 'List' }, { label: 'Details' }] },
          {
            label: 'Favorites',
            items: ['My Computer', 'My Documents', 'Control Panel'].map((place) => ({
              label: place,
              onSelect: () => navigate(place),
            })),
          },
          { label: 'Tools', items: [{ label: 'Folder Options...' }] },
          {
            label: 'Help',
            items: [
              { label: 'Help and Support Center', onSelect: () => showHelpAndSupport(shell) },
              'separator',
              { label: 'About Windows', onSelect: () => showAbout(shell, 'Windows', getIconForPath(currentLoc)) },
            ],
          },
        ]}
      >
        {/* Windows flag in the menu bar corner */}
        <div className="ml-auto self-stretch flex items-center px-2 bg-white border-l border-[#d8d2bd]">
          <XPLogo className="w-[20px] h-[17px]" />
        </div>
      </MenuBar>

      {/* 2. REFINED LUNA TOOLBAR */}
      <div className="flex items-center px-1.5 py-1 bg-[#f6f6ef] border-b border-[#dedede] space-x-1.5 select-none overflow-x-hidden min-w-0 flex-shrink-0">
        {/* Back */}
        <button
          disabled={!canGoBack(history)}
          onClick={() => setHistory(back)}
          className="flex items-center space-x-1 px-1.5 py-1 rounded hover:bg-[#e0e0d0] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer group flex-shrink-0"
        >
          <div className="w-[20px] h-[20px] rounded-full bg-[#3d7f1d] border border-[#2e5d17] flex items-center justify-center text-white font-bold text-xs select-none">
            ◀
          </div>
          <span className="font-bold text-xp-body text-gray-700 group-hover:text-black">Back</span>
          <span className="text-xp-micro text-[#3d7f1d]">▼</span>
        </button>

        {/* Forward */}
        <button
          disabled={!canGoForward(history)}
          onClick={() => setHistory(forward)}
          className="flex items-center space-x-1 px-1.5 py-1 rounded hover:bg-[#e0e0d0] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer group flex-shrink-0"
        >
          <div className="w-[20px] h-[20px] rounded-full bg-[#3d7f1d] border border-[#2e5d17] flex items-center justify-center text-white font-bold text-xs select-none">
            ▶
          </div>
          <span className="font-bold text-xp-body text-gray-700 group-hover:text-black">Forward</span>
          <span className="text-xp-micro text-[#3d7f1d]">▼</span>
        </button>

        {/* Up */}
        <button
          onClick={goUp}
          disabled={currentLoc === 'My Computer' || currentLoc === 'My Documents' || currentLoc === 'Control Panel'}
          className="flex items-center space-x-1 px-1.5 py-1 rounded hover:bg-[#e0e0d0] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer text-gray-700 hover:text-black flex-shrink-0"
        >
          <div className="w-5 h-5 flex items-center justify-center bg-yellow-500 rounded border border-yellow-600 text-white text-xp-caption font-bold">
            ▲
          </div>
          <span className="font-sans text-xp-body">Up</span>
        </button>

        <div className="h-5 w-[1px] bg-gray-300 mx-1 flex-shrink-0"></div>

        {/* Search */}
        <button
          onClick={() => {
            sound.play('click');
            shell.open('internet_explorer', { url: 'http://google.com' });
          }}
          className="flex items-center space-x-1 px-1.5 py-1 rounded hover:bg-[#e0e0d0] cursor-pointer text-gray-700 hover:text-black flex-shrink-0"
        >
          <SafeIcon src="/assets/xp-icons/Search.png" className="w-5 h-5 object-contain" size={20} alt="" />
          <span className="font-sans text-xp-body">Search</span>
        </button>

        {/* Folders */}
        <button
          onClick={() => {
            sound.play('click');
            navigate('My Computer');
          }}
          className="flex items-center space-x-1 px-1.5 py-1 rounded hover:bg-[#e0e0d0] cursor-pointer text-gray-700 hover:text-black flex-shrink-0"
        >
          <SafeIcon src="/assets/xp-icons/Folder Closed.png" className="w-5 h-5 object-contain" size={20} alt="" />
          <span className="font-sans text-xp-body">Folders</span>
        </button>

        <div className="h-5 w-[1px] bg-gray-300 mx-1 flex-shrink-0"></div>

        {/* Views dropdown */}
        <button className="flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-[#e0e0d0] cursor-pointer text-gray-700 flex-shrink-0">
          <SafeIcon src="/assets/xp-icons/Folder View.png" className="w-5 h-5 object-contain" size={20} alt="" />
          <span className="text-xp-micro">▼</span>
        </button>
      </div>

      {/* 3. ADDRESS BAR */}
      <div className="flex items-center px-2 py-1.5 bg-[#f6f6ef] border-b border-[#dedede] space-x-1.5 text-xp-body select-none flex-shrink-0 min-w-0">
        <span className="text-gray-500 font-sans font-medium flex-shrink-0">Address</span>
        <div className="flex-1 min-w-0 flex items-center bg-white border border-gray-300 rounded shadow-inner overflow-hidden px-1 py-0.5">
          <SafeIcon src={getIconForPath(currentLoc)} className="w-3.5 h-3.5 object-contain mr-1.5 flex-shrink-0" size={14} alt="" />
          <input
            type="text"
            readOnly
            value={currentLoc}
            className="flex-1 min-w-0 bg-transparent outline-none text-black select-text text-xp-body font-sans truncate"
          />
          <span className="text-xp-caption text-gray-400 px-1 font-sans cursor-pointer flex-shrink-0">▼</span>
        </div>
        <button
          onClick={() => {
            sound.play('click');
          }}
          className="px-2 py-0.5 border border-gray-300 bg-white hover:bg-neutral-100 rounded flex items-center justify-center space-x-1 cursor-pointer font-sans shadow-sm flex-shrink-0"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xp-glyph">▶</span>
          <span className="font-bold text-xp-caption text-gray-800">Go</span>
        </button>
      </div>

      {/* 4. CONTENT PANE CONTAINER */}
      <div className="flex-1 flex overflow-hidden min-h-0 min-w-0 bg-[#e7ebf7]">
        {/* LEFT LUNA SIDEBARPANEL */}
        <div className="w-[180px] bg-gradient-to-b from-[#749bec] to-[#c8d7f4] flex-shrink-0 flex flex-col p-2 space-y-2.5 overflow-y-auto border-r border-[#6487dc]/30 font-sans">
          {/* PANEL 1: Tasks (Context Sensitive) */}
          <div className="rounded-t-[5px] border border-white bg-white/70 overflow-hidden shadow-sm flex flex-col">
            <div className="xp-taskpane-header px-2.5 py-1.5 flex items-center justify-between border-b border-white select-none">
              <span>{isMyComputer ? 'System Tasks' : isControlPanel ? 'Control Panel Tasks' : 'File and Folder Tasks'}</span>
              <span className="text-xp-glyph opacity-80">▲</span>
            </div>
            <div className="p-2 flex flex-col space-y-1.5 bg-[#f0f4f9] text-xp-body">
              {isMyComputer && (
                <>
                  <button
                    onClick={() => shell.showDialog(
                      'System Properties',
                      'System: Windows XP Professional (SP2)\nComputer: Suriya Agentic Core\nProcessor: Intel Pentium 4\nRAM: 640 KB Base (Extended 1024 KB)',
                      '/assets/xp-icons/My Computer.png'
                    )}
                    className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <SafeIcon src="/assets/xp-icons/System Information.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>View system info</span>
                  </button>
                  <button
                    onClick={() => navigate('Control Panel')}
                    className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <SafeIcon src="/assets/xp-icons/Add or Remove Windows Components.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>Add/remove programs</span>
                  </button>
                  <button
                    onClick={() => navigate('Control Panel')}
                    className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <SafeIcon src="/assets/xp-icons/Control Panel.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>Change a setting</span>
                  </button>
                </>
              )}
              {isControlPanel && (
                <button
                  onClick={() => {
                    sound.play('click');
                  }}
                  className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <SafeIcon src="/assets/xp-icons/Folder View - Classic.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>Switch to Classic View</span>
                </button>
              )}
              {!isMyComputer && !isControlPanel && (
                <>
                  <button
                    onClick={() => shell.showDialog('New Folder', 'Folder created successfully in temporary workspace.', '/assets/xp-icons/Folder Closed.png')}
                    className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <SafeIcon src="/assets/xp-icons/Folder Closed.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>Make a new folder</span>
                  </button>
                  <button
                    onClick={() => shell.showDialog('Publish to Web', 'Web publishing service is currently offline in this vintage environment.', '/assets/xp-icons/Internet Explorer 6.png')}
                    className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <SafeIcon src="/assets/xp-icons/Network Places.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>Publish to Web</span>
                  </button>
                  <button
                    onClick={() => shell.showDialog('Sharing', 'This folder is shared on the local workstation for user Suriya.', '/assets/xp-icons/Folder Closed.png')}
                    className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <SafeIcon src="/assets/xp-icons/Sharing Hand.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>Share this folder</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* PANEL 2: Other Places */}
          <div className="rounded-t-[5px] border border-white bg-white/70 overflow-hidden shadow-sm flex flex-col">
            <div className="xp-taskpane-header px-2.5 py-1.5 flex items-center justify-between border-b border-white select-none">
              <span>{isControlPanel ? 'See Also' : 'Other Places'}</span>
              <span className="text-xp-glyph opacity-80">▲</span>
            </div>
            <div className="p-2 flex flex-col space-y-1.5 bg-[#f0f4f9] text-xp-body">
              {isControlPanel ? (
                <>
                  <button
                    onClick={() => shell.showDialog('Windows Update', 'Your system is fully up to date with the latest 1985–XP rollups.', '/assets/xp-icons/Help and Support.png')}
                    className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <SafeIcon src="/assets/xp-icons/Windows Update.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>Windows Update</span>
                  </button>
                  <button
                    onClick={() => showHelpAndSupport(shell)}
                    className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <SafeIcon src="/assets/xp-icons/Help and Support.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>Help and Support</span>
                  </button>
                  <button
                    onClick={() => shell.showDialog('Other Options', 'Custom system settings are locked by Administrator policy.', '/assets/xp-icons/Control Panel.png')}
                    className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <SafeIcon src="/assets/xp-icons/Folder Options.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>Other Options</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => shell.showDialog('My Network Places', 'Entire Network: Local Workgroup (SURIYA_NET) is active with 0 remote clients.', '/assets/xp-icons/Network Connections.png')}
                    className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <SafeIcon src="/assets/xp-icons/Network Places.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>My Network Places</span>
                  </button>
                  {currentLoc !== 'My Documents' && (
                    <button
                      onClick={() => navigate('My Documents')}
                      className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <SafeIcon src="/assets/xp-icons/My Documents.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>My Documents</span>
                    </button>
                  )}
                  {currentLoc !== 'My Computer' && (
                    <button
                      onClick={() => navigate('My Computer')}
                      className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <SafeIcon src="/assets/xp-icons/My Computer.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>My Computer</span>
                    </button>
                  )}
                  {currentLoc !== 'Control Panel' && (
                    <button
                      onClick={() => navigate('Control Panel')}
                      className="text-left text-[#3d5fa6] hover:text-[#18469c] hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <SafeIcon src="/assets/xp-icons/Control Panel.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>Control Panel</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* PANEL 3: Details */}
          <div className="rounded-t-[5px] border border-white bg-white/70 overflow-hidden shadow-sm flex flex-col select-none">
            <div className="xp-taskpane-header px-2.5 py-1.5 flex items-center justify-between border-b border-white">
              <span>Details</span>
              <span className="text-xp-glyph opacity-80">▲</span>
            </div>
            <div className="p-2 flex flex-col space-y-1 bg-[#f0f4f9] text-xp-caption text-gray-700">
              <span className="font-bold text-gray-900 leading-tight">{currentLoc}</span>
              <span>System Folder</span>
              <span className="border-t border-gray-300 pt-1 mt-1 opacity-70">Double-click items inside to explore.</span>
            </div>
          </div>
        </div>

        {/* MAIN GRID VIEW AREA */}
        <div className="flex-1 min-w-0 bg-white p-3.5 overflow-y-auto select-none">
          {/* GRID CONTENTS FOR: My Computer */}
          {currentLoc === 'My Computer' && (
            <div className="flex flex-col space-y-4">
              {/* 1. Files Stored on This Computer */}
              <div>
                <div className="text-xp-body font-sans font-semibold text-gray-600 border-b border-[#0058e6]/10 pb-0.5 mb-2.5">
                  Files Stored on This Computer
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
                  <div
                    onDoubleClick={() => navigate('My Documents')}
                    className="flex items-center space-x-2.5 p-1 rounded hover:bg-sky-50 active:bg-sky-100 cursor-pointer group min-w-0"
                  >
                    <SafeIcon src="/assets/xp-icons/Folder Closed.png" className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
                    <span className="font-sans text-xp-body text-neutral-800 font-medium group-hover:underline truncate min-w-0 flex-1">Shared Documents</span>
                  </div>
                  <div
                    onDoubleClick={() => navigate('My Documents')}
                    className="flex items-center space-x-2.5 p-1 rounded hover:bg-sky-50 active:bg-sky-100 cursor-pointer group min-w-0"
                  >
                    <SafeIcon src="/assets/xp-icons/Folder Closed.png" className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
                    <span className="font-sans text-xp-body text-neutral-800 font-medium group-hover:underline truncate min-w-0 flex-1">Suriya's Documents</span>
                  </div>
                </div>
              </div>

              {/* 2. Hard Disk Drives */}
              <div>
                <div className="text-xp-body font-sans font-semibold text-gray-600 border-b border-[#0058e6]/10 pb-0.5 mb-2">
                  Hard Disk Drives
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
                  <div
                    onDoubleClick={() => navigate('Local Disk (C:)')}
                    className="flex items-center space-x-2.5 p-1 rounded hover:bg-sky-50 active:bg-sky-100 cursor-pointer group min-w-0"
                  >
                    <SafeIcon src="/assets/xp-icons/Local Disk.png" className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
                    <span className="font-sans text-xp-body text-neutral-800 font-medium group-hover:underline truncate min-w-0 flex-1">Local Disk (C:)</span>
                  </div>
                </div>
              </div>

              {/* 3. Devices with Removable Storage */}
              <div>
                <div className="text-xp-body font-sans font-semibold text-gray-600 border-b border-[#0058e6]/10 pb-0.5 mb-2">
                  Devices with Removable Storage
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
                  <div
                    onDoubleClick={() => {
                      sound.tune([
                        { freq: 220, ms: 100, wave: 'square', at: 0 },
                        { freq: 220, ms: 100, wave: 'square', at: 150 },
                      ]);
                      shell.showDialog('Drive A:', 'Please insert a floppy disk into drive A:.', '/assets/xp-icons/Floppy Disk.png');
                    }}
                    className="flex items-center space-x-2.5 p-1 rounded hover:bg-sky-50 active:bg-sky-100 cursor-pointer group min-w-0"
                  >
                    <SafeIcon src="/assets/xp-icons/Floppy Disk.png" className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
                    <span className="font-sans text-xp-body text-neutral-800 font-medium group-hover:underline truncate min-w-0 flex-1">3½ Floppy (A:)</span>
                  </div>
                  <div
                    onDoubleClick={() => {
                      sound.tune([
                        { freq: 880, ms: 50, wave: 'sine', at: 0 },
                        { freq: 980, ms: 80, wave: 'sine', at: 80 },
                      ]);
                      shell.showDialog('CD-ROM Drive (D:)', 'CD Drive (D:) is empty. Please insert a compact disc.', '/assets/xp-icons/CD-ROM.png');
                    }}
                    className="flex items-center space-x-2.5 p-1 rounded hover:bg-sky-50 active:bg-sky-100 cursor-pointer group min-w-0"
                  >
                    <SafeIcon src="/assets/xp-icons/CD-ROM.png" className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
                    <span className="font-sans text-xp-body text-neutral-800 font-medium group-hover:underline truncate min-w-0 flex-1">CD Drive (D:)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GRID CONTENTS FOR: My Documents */}
          {currentLoc === 'My Documents' && (
            <div className="flex flex-col space-y-4">
              <div className="text-xp-body font-sans font-semibold text-gray-600 border-b border-[#0058e6]/10 pb-0.5 mb-2.5">
                Folders
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
                {/* One folder per project, opening that project in My Projects */}
                {profile.projects.map((project) => (
                  <div
                    key={project.id}
                    onDoubleClick={() => shell.open('my_projects', { project: project.id })}
                    title={project.summary}
                    className="flex items-center space-x-2.5 p-1 rounded hover:bg-sky-50 active:bg-sky-100 cursor-pointer group min-w-0"
                  >
                    <SafeIcon src="/assets/xp-icons/Folder Closed.png" className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
                    <span className="font-sans text-xp-body text-neutral-800 font-medium group-hover:underline truncate min-w-0 flex-1">{project.name}</span>
                  </div>
                ))}
                <div
                  onDoubleClick={() => navigate('My Music')}
                  className="flex items-center space-x-2.5 p-1 rounded hover:bg-sky-50 active:bg-sky-100 cursor-pointer group min-w-0"
                >
                  <SafeIcon src="/assets/xp-icons/My Music.png" className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
                  <span className="font-sans text-xp-body text-neutral-800 font-medium group-hover:underline truncate min-w-0 flex-1">My Music</span>
                </div>
                <div
                  onDoubleClick={() => navigate('My Pictures')}
                  className="flex items-center space-x-2.5 p-1 rounded hover:bg-sky-50 active:bg-sky-100 cursor-pointer group min-w-0"
                >
                  <SafeIcon src="/assets/xp-icons/My Pictures.png" className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
                  <span className="font-sans text-xp-body text-neutral-800 font-medium group-hover:underline truncate min-w-0 flex-1">My Pictures</span>
                </div>
                <div
                  onDoubleClick={() => shell.showDialog('My Videos', 'This folder is empty. (0 media files found)', '/assets/xp-icons/Generic Video.png')}
                  className="flex items-center space-x-2.5 p-1 rounded hover:bg-sky-50 active:bg-sky-100 cursor-pointer group min-w-0"
                >
                  <SafeIcon src="/assets/xp-icons/Generic Video.png" className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
                  <span className="font-sans text-xp-body text-neutral-800 font-medium group-hover:underline truncate min-w-0 flex-1">My Videos</span>
                </div>
              </div>
            </div>
          )}

          {/* GRID CONTENTS FOR: My Music */}
          {currentLoc === 'My Music' && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <SafeIcon src="/assets/xp-icons/My Music.png" className="w-16 h-16 object-contain opacity-50 mb-2" size={64} alt="" />
              <span>This folder is empty.</span>
            </div>
          )}

          {/* GRID CONTENTS FOR: My Pictures */}
          {currentLoc === 'My Pictures' && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <SafeIcon src="/assets/xp-icons/My Pictures.png" className="w-16 h-16 object-contain opacity-50 mb-2" size={64} alt="" />
              <span>This folder is empty.</span>
            </div>
          )}

          {/* GRID CONTENTS FOR: Local Disk C: */}
          {currentLoc === 'Local Disk (C:)' && (
            <div className="flex flex-col space-y-4">
              <div className="text-xp-body font-sans font-semibold text-gray-600 border-b border-[#0058e6]/10 pb-0.5 mb-2.5">
                Applications & Documents inside C:\WINDOWS
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
                {[
                  { title: 'ABOUT_ME.TXT', type: 'doc', icon: appIcon('notepad'), action: () => { shell.open('notepad', { file: 'ABOUT_ME.TXT' }); } },
                  { title: 'RESUME.TXT', type: 'doc', icon: appIcon('notepad'), action: () => { shell.open('notepad', { file: 'RESUME.TXT' }); } },
                  { title: 'PAINT.EXE', type: 'app', icon: appIcon('paint'), action: () => shell.open('paint') },
                  { title: 'REVERSI.EXE', type: 'app', icon: appIcon('reversi'), action: () => shell.open('reversi') },
                  { title: 'CALC.EXE', type: 'app', icon: appIcon('calc'), action: () => shell.open('calc') },
                  { title: 'CLOCK.EXE', type: 'app', icon: appIcon('clock'), action: () => shell.open('clock') },
                ].map((f, idx) => (
                  <div
                    key={idx}
                    onDoubleClick={() => {
                      f.action();
                      sound.tune([
                        { freq: 880, ms: 20, wave: 'sine', at: 0 },
                        { freq: 1200, ms: 30, wave: 'sine', at: 30 },
                      ]);
                    }}
                    className="flex items-center space-x-2.5 p-1 rounded hover:bg-sky-50 active:bg-sky-100 cursor-pointer group min-w-0"
                  >
                    <SafeIcon src={f.icon} className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-sans text-xp-body text-gray-800 font-semibold group-hover:underline truncate">{f.title}</span>
                      <span className="text-xp-caption text-gray-400 leading-none truncate">{f.type === 'app' ? 'Application' : 'Text Document'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GRID CONTENTS FOR: Control Panel */}
          {currentLoc === 'Control Panel' && (
            <div className="flex flex-col space-y-4">
              <div className="text-xp-body font-sans font-bold text-gray-700 mb-1">
                Pick a category
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-x-3 gap-y-3 pr-1">
                {[
                  {
                    title: 'Appearance and Themes',
                    desc: 'Change your themes or desktop background wallpaper.',
                    icon: '/assets/xp-icons/Appearance.png',
                    action: () => shell.showDialog(
                'Display Properties',
                'Theme: Windows XP\nDesktop: Bliss',
                '/assets/xp-icons/Appearance.png'
              )
                  },
                  {
                    title: 'Printers and Other Hardware',
                    desc: 'View or setup your keyboards, mice, and printers.',
                    icon: '/assets/xp-icons/Printers and Hardware.png',
                    action: () => shell.showDialog(
                      'Printers and Other Hardware',
                      'Device Manager: Standard 101/102-Key Keyboard, PS/2 Mouse, and Generic Dot-Matrix Printer are operating normally.',
                      '/assets/xp-icons/Printers and Hardware.png'
                    )
                  },
                  {
                    title: 'Network and Internet Connections',
                    desc: 'Check internet state and connections.',
                    icon: '/assets/xp-icons/Connection Status.png',
                    action: () => shell.showDialog(
                      'Network Connections',
                      'TCP/IP Protocol Driver: Online\nGateway: 192.168.1.1\nStatus: Connected at 100.0 Mbps',
                      '/assets/xp-icons/Connection Status.png'
                    )
                  },
                  {
                    title: 'User Accounts',
                    desc: 'Configure or modify profiles (Change Suriya name, details).',
                    icon: '/assets/xp-icons/User Accounts.png',
                    action: () => shell.showDialog(
                      'User Accounts',
                      'Current User: Suriya\nGroup: Computer Administrators\nPassword: Not required (Auto-Logon Enabled)',
                      '/assets/xp-icons/User Accounts.png'
                    )
                  },
                  {
                    title: 'Add or Remove Programs',
                    desc: 'Simulate package installations or system cleanups.',
                    icon: '/assets/xp-icons/Add or Remove Windows Components.png',
                    action: () => shell.showDialog(
                      'Add or Remove Programs',
                      'No additional third-party software packages installed in this image.',
                      '/assets/xp-icons/Add or Remove Windows Components.png'
                    )
                  },
                  {
                    title: 'Date, Time, and Regional Options',
                    desc: 'Adjust date, time specifications and regional format settings.',
                    icon: '/assets/xp-icons/Date and Time.png',
                    action: () => shell.open('clock')
                  },
                  {
                    title: 'Sounds, Speech, and Audio Devices',
                    desc: 'Switch system volume alerts and play beep tests.',
                    icon: '/assets/xp-icons/Volume.png',
                    action: () => {
                      sound.tune([
                        { freq: 440, ms: 150, wave: 'sine', at: 0 },
                        { freq: 660, ms: 150, wave: 'sine', at: 120 },
                        { freq: 880, ms: 200, wave: 'sine', at: 240 },
                      ]);
                      shell.showDialog(
                        'Sounds and Audio Devices',
                        'Audio Hardware: Sound Blaster 16 Compatible\nDiagnostic chime test sounded successfully.',
                        '/assets/xp-icons/Volume.png'
                      );
                    }
                  },
                  {
                    title: 'Accessibility Options',
                    desc: 'Toggle visual accessibility features.',
                    icon: '/assets/xp-icons/Accessibility Wizard.png',
                    action: () => shell.showDialog(
                      'Accessibility Options',
                      'High Contrast is off.',
                      '/assets/xp-icons/Accessibility Wizard.png'
                    )
                  },
                  {
                    title: 'Performance and Maintenance',
                    desc: 'Execute defragmentation check or inspect RAM capacity.',
                    icon: '/assets/xp-icons/Performance.png',
                    action: () => shell.showDialog(
                      'Performance Options',
                      'Conventional Memory: 640 KB Free\nExtended RAM: 1024 KB Available\nHard Drive C: File System FAT16 (Defragmented 100%)',
                      '/assets/xp-icons/Performance.png'
                    )
                  },
                  {
                    title: 'Security Center',
                    desc: 'Run a malware scans or verify active firewalls.',
                    icon: '/assets/xp-icons/Security Center.png',
                    action: () => shell.showDialog(
                      'Windows Security Center',
                      'Firewall: ON\nAutomatic Updates: ON\nVirus Protection: ON (SentinelCore Realtime Hardened)',
                      '/assets/xp-icons/Security Center.png'
                    )
                  }
                ].map((cat, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      cat.action();
                      sound.play('click');
                    }}
                    className="flex items-start space-x-2.5 p-1 rounded hover:bg-sky-50 active:bg-sky-100 cursor-pointer group min-w-0"
                  >
                    <SafeIcon src={cat.icon} className="w-8 h-8 object-contain flex-shrink-0 mt-0.5" size={32} alt="" />
                    <div className="flex flex-col text-left min-w-0 flex-1">
                      <span className="font-sans text-xp-body text-[#3c5fa0] font-bold group-hover:text-blue-900 group-hover:underline leading-tight truncate">{cat.title}</span>
                      <span className="text-xp-caption text-gray-500 font-sans mt-0.5 leading-tight line-clamp-2">{cat.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. AUTHENTIC WINDOWS XP SEGMENTED STATUS BAR */}
      <div className="h-[22px] bg-[#ece9d8] border-t border-[#d4d0c8] px-2 flex items-center justify-between text-xp-body text-gray-700 font-sans select-none flex-shrink-0">
        <div className="flex-1 truncate pr-2 border-r border-[#d4d0c8]/80 text-xp-body">
          {isMyComputer
            ? '3 object(s) (Disk free space: 42.8 GB)'
            : isControlPanel
            ? '10 category item(s)'
            : '3 folder(s)'}
        </div>
        <div className="pl-3 flex items-center space-x-1 text-xp-body text-gray-600">
          <SafeIcon
            src={getIconForPath(currentLoc)}
            className="w-3.5 h-3.5 object-contain"
            size={14}
            alt=""
          />
          <span className="font-medium">{currentLoc}</span>
        </div>
      </div>
    </div>
  );
}
