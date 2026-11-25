import { useEffect, useState } from 'react';
import { MenuBar } from '../../components/MenuBar';
import { SafeIcon } from '../../components/SafeIcon';
import { appIcon, webAddress } from '../../os/apps';
import { back, canGoBack, canGoForward, current, forward, go, startHistory } from '../../os/history';
import { contactLinks, profile } from '../../os/profile';
import { sound } from '../../os/sound';
import { showAbout, showHelpAndSupport, useShell, type AppProps } from '../../os/shell';

export const HOME = 'http://suriya.ai/portfolio';
const SEARCH = 'http://google.com';

/** Internet Explorer 6, browsing the portfolio homepage and a pretend search engine. */
export default function InternetExplorerWindow({ id, launch }: AppProps) {
  const shell = useShell();
  const [history, setHistory] = useState(() => startHistory(launch?.url ?? HOME));
  const url = current<string>(history);
  const [address, setAddress] = useState(url);
  const [searchQuery, setSearchQuery] = useState('');

  /** Every way of reaching a page goes through history, so Back always returns to the page before. */
  const browse = (next: string) => setHistory((h) => go(h, next));
  const goToAddress = () => {
    browse(webAddress(address));
    sound.play('click');
  };

  useEffect(() => setAddress(url), [url]);
  useEffect(() => {
    if (launch?.url) browse(launch.url);
  }, [launch?.seq]);

  return (

    <div className="flex-1 flex flex-col h-full bg-[#ece9d8] text-black font-sans text-xs select-none">
      {/* 1. IE6 MENU BAR WITH SPINNING GLOBE */}
      <MenuBar
        className="xp-menubar border-b border-[#dedede]"
        menus={[
          { label: 'File', items: [{ label: 'New Window' }, 'separator', { label: 'Close', onSelect: () => shell.close(id) }] },
          { label: 'Edit', items: [{ label: 'Cut' }, { label: 'Copy' }, { label: 'Paste' }] },
          { label: 'View', items: [{ label: 'Source' }] },
          {
            label: 'Favorites',
            items: [
              { label: 'Home Page', onSelect: () => browse(HOME) },
              { label: 'Search the Web', onSelect: () => browse(SEARCH) },
              // The profile's own web links open for real, in a new browser tab.
              ...contactLinks(profile.contact)
                .filter((link) => link.href.startsWith('http'))
                .map((link) => ({ label: link.label, onSelect: () => window.open(link.href, '_blank', 'noopener') })),
            ],
          },
          { label: 'Tools', items: [{ label: 'Internet Options...' }] },
          {
            label: 'Help',
            items: [
              { label: 'Help and Support', onSelect: () => showHelpAndSupport(shell) },
              'separator',
              {
                label: 'About Internet Explorer',
                onSelect: () => showAbout(shell, 'Internet Explorer', appIcon('internet_explorer')),
              },
            ],
          },
        ]}
      >
        {/* Iconic Spinning Windows XP IE Globe Logo */}
        <div className="ml-auto w-[26px] h-[26px] bg-[#f0ede0] border border-[#7f9db9] shadow-inner rounded-xs flex items-center justify-center mr-1 select-none overflow-hidden">
          <SafeIcon
            src="/assets/xp-icons/Internet Explorer 6.png"
            className="w-5 h-5 object-contain hover:rotate-45 transition-transform duration-300"
            size={20}
            alt="IE6 Globe"
          />
        </div>
      </MenuBar>

      {/* 2. AUTHENTIC LUNA TOOLBAR */}
      <div className="px-1.5 py-1 bg-[#ece9d8] border-b border-[#dedede] flex items-center space-x-1 select-none overflow-x-hidden min-w-0 flex-shrink-0">
        <div className="xp-toolbar-grip"></div>

        {/* Back Button */}
        <button
          disabled={!canGoBack(history)}
          onClick={() => {
            setHistory(back);
            sound.play('click');
          }}
          className="flex items-center space-x-1 px-1.5 py-1 rounded hover:bg-[#e0e0d0] disabled:opacity-35 cursor-pointer group flex-shrink-0"
          title="Back"
        >
          <div className="w-[20px] h-[20px] rounded-full bg-[#3d7f1d] border border-[#2e5d17] flex items-center justify-center text-white font-bold text-xs select-none">
            ◀
          </div>
          <span className="font-bold text-xp-body text-gray-800">Back</span>
          <span className="text-xp-micro text-[#3d7f1d]">▼</span>
        </button>

        {/* Forward Button */}
        <button
          disabled={!canGoForward(history)}
          onClick={() => {
            setHistory(forward);
            sound.play('click');
          }}
          className="flex items-center space-x-1 px-1.5 py-1 rounded hover:bg-[#e0e0d0] disabled:opacity-35 cursor-pointer group flex-shrink-0"
          title="Forward"
        >
          <div className="w-[20px] h-[20px] rounded-full bg-[#3d7f1d] border border-[#2e5d17] flex items-center justify-center text-white font-bold text-xs select-none">
            ▶
          </div>
          <span className="font-bold text-xp-body text-gray-800">Forward</span>
          <span className="text-xp-micro text-[#3d7f1d]">▼</span>
        </button>

        {/* Stop */}
        <button
          onClick={() => {
            sound.play('click');
          }}
          className="xp-ie-btn flex-shrink-0"
          title="Stop"
        >
          <SafeIcon src="/assets/xp-icons/IE Stop.png" className="w-5 h-5 object-contain" size={20} alt="Stop" />
          <span>Stop</span>
        </button>

        {/* Refresh */}
        <button
          onClick={() => {
            sound.beep(400, 40, 'sine');
          }}
          className="xp-ie-btn flex-shrink-0"
          title="Refresh"
        >
          <SafeIcon src="/assets/xp-icons/IE Refresh.png" className="w-5 h-5 object-contain" size={20} alt="Refresh" />
          <span>Refresh</span>
        </button>

        {/* Home */}
        <button
          onClick={() => {
            browse(HOME);
            sound.play('click');
          }}
          className="xp-ie-btn flex-shrink-0"
          title="Home"
        >
          <SafeIcon src="/assets/xp-icons/IE Home.png" className="w-5 h-5 object-contain" size={20} alt="Home" />
          <span>Home</span>
        </button>

        <div className="h-5 w-[1px] bg-gray-300 mx-1 flex-shrink-0 shadow-[1px_0_0_#ffffff]"></div>

        {/* Search */}
        <button
          onClick={() => {
            browse(SEARCH);
            sound.play('click');
          }}
          className="xp-ie-btn flex-shrink-0"
          title="Search"
        >
          <SafeIcon src="/assets/xp-icons/Search.png" className="w-5 h-5 object-contain" size={20} alt="Search" />
          <span>Search</span>
        </button>

        {/* Favorites */}
        <button
          onClick={() => {
            sound.play('click');
          }}
          className="xp-ie-btn flex-shrink-0"
          title="Favorites"
        >
          <SafeIcon src="/assets/xp-icons/Favorites.png" className="w-5 h-5 object-contain" size={20} alt="Favorites" />
          <span>Favorites</span>
        </button>

        {/* History */}
        <button
          onClick={() => {
            sound.play('click');
          }}
          className="xp-ie-btn flex-shrink-0"
          title="History"
        >
          <SafeIcon src="/assets/xp-icons/Delete Internet History.png" className="w-5 h-5 object-contain" size={20} alt="History" />
          <span>History</span>
        </button>

        <div className="h-5 w-[1px] bg-gray-300 mx-1 flex-shrink-0 shadow-[1px_0_0_#ffffff]"></div>

        {/* Print */}
        <button
          onClick={() => {
            sound.play('click');
          }}
          className="xp-ie-btn flex-shrink-0"
          title="Print"
        >
          <SafeIcon src="/assets/xp-icons/Printer.png" className="w-5 h-5 object-contain" size={20} alt="Print" />
          <span>Print</span>
        </button>
      </div>

      {/* 3. AUTHENTIC ADDRESS BAR */}
      <div className="px-2 py-1 bg-[#ece9d8] border-b border-[#dedede] flex items-center space-x-1.5 text-xp-body select-none flex-shrink-0 min-w-0">
        <div className="xp-toolbar-grip"></div>
        <span className="text-gray-600 font-sans font-medium flex-shrink-0">Address</span>
        <div className="flex-1 min-w-0 flex items-center bg-white border border-[#7f9db9] rounded-xs shadow-inner overflow-hidden px-1.5 py-0.5">
          <SafeIcon src="/assets/xp-icons/Internet Explorer 6.png" className="w-3.5 h-3.5 object-contain mr-1.5 flex-shrink-0" size={14} alt="" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') goToAddress();
            }}
            className="flex-1 min-w-0 bg-transparent outline-none text-black select-text text-xp-body font-sans truncate selection:bg-[#316ac5] selection:text-white"
          />
          <span className="text-xp-caption text-gray-400 px-1 font-sans cursor-pointer flex-shrink-0">▼</span>
        </div>
        <button
          onClick={goToAddress}
          className="px-2 py-0.5 border border-[#7f9db9] bg-white hover:bg-neutral-100 rounded flex items-center justify-center space-x-1 cursor-pointer font-sans shadow-sm flex-shrink-0"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xp-glyph">▶</span>
          <span className="font-bold text-xp-body text-gray-800">Go</span>
        </button>
        <div className="h-4 w-[1px] bg-gray-300 mx-1 flex-shrink-0"></div>
        <span className="text-gray-500 font-sans text-xp-body cursor-pointer hover:underline pr-1 select-none flex-shrink-0">Links »</span>
      </div>

      {/* Browser Content Area */}
      <div className="flex-1 bg-white overflow-y-auto p-4 border border-inset border-gray-300 win1-scrollbar select-text selection:bg-blue-600 selection:text-white">
        {(() => {
          const normalizedUrl = url.toLowerCase().replace('https://', '').replace('http://', '').replace('www.', '').trim();

          if (normalizedUrl.includes('suriya.ai') || normalizedUrl === '') {
            return (
              <div className="space-y-4">
                <div className="text-center pb-3 border-b border-gray-300">
                  <h1 className="text-xl font-extrabold text-blue-900 tracking-wide select-none">SURIYA'S SPACE AGE HOMEPAGE</h1>
                  <marquee className="text-xs text-red-600 font-bold mt-1">*** Welcome to the Internet of the 21st Century! *** Powered by Neural Network Architectures ***</marquee>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-blue-400 p-3 bg-blue-50/50 rounded">
                    <h3 className="font-bold text-xs text-blue-800 border-b border-blue-200 pb-1 flex items-center space-x-1">
                      <span>⚡️</span>
                      <span>MISSION STATEMENT</span>
                    </h3>
                    <p className="text-xp-body leading-relaxed mt-1.5 text-neutral-700 font-sans">
                      We build intelligent, modular web platforms powered by cutting-edge neural models. We believe in visual playfulness combined with military-grade stability.
                    </p>
                  </div>

                  <div className="border border-green-400 p-3 bg-green-50/50 rounded">
                    <h3 className="font-bold text-xs text-green-800 border-b border-green-200 pb-1 flex items-center space-x-1">
                      <SafeIcon src="/assets/xp-icons/My Computer.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" />
                      <span>SYSTEM STATUS</span>
                    </h3>
                    <p className="text-xp-body leading-relaxed mt-1.5 text-neutral-700 font-mono">
                      Core: SURIYA RETRO v1.0<br />
                      Status: ONLINE & REACTIVE<br />
                      Neural Speed: 12.5 GigaFlops<br />
                      Cognitive Depth: Unlimited
                    </p>
                  </div>
                </div>

                <div className="p-3 border border-gray-300 rounded bg-neutral-50">
                  <h3 className="font-bold text-xs text-gray-800 border-b border-gray-200 pb-1">PORTFOLIO DIRECT LINKS</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2 font-bold">
                    <button
                      onClick={() => {
                        shell.open('notepad', { file: 'ABOUT_ME.TXT' });
                      }}
                      className="text-left text-blue-600 hover:underline cursor-pointer flex items-center space-x-1 text-xp-body"
                    >
                      <SafeIcon src="/assets/xp-icons/Generic Text Document.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>Read BIO (ABOUT_ME.TXT)</span>
                    </button>
                    <button
                      onClick={() => {
                        shell.open('notepad', { file: 'RESUME.TXT' });
                      }}
                      className="text-left text-blue-600 hover:underline cursor-pointer flex items-center space-x-1 text-xp-body"
                    >
                      <SafeIcon src="/assets/xp-icons/Generic Text Document.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>Read RESUME (RESUME.TXT)</span>
                    </button>
                    <button
                      onClick={() => shell.open('my_projects')}
                      className="text-left text-blue-600 hover:underline cursor-pointer flex items-center space-x-1 text-xp-body"
                    >
                      <SafeIcon src="/assets/xp-icons/Folder Closed.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> <span>Browse Projects Catalog</span>
                    </button>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-gray-300 text-xp-caption text-gray-500">
                  <p>Best viewed in 800x600 resolution with 16-bit color. Netscape Navigator compatible.</p>
                  <div className="flex justify-center space-x-2 mt-2">
                    <span className="p-1 px-2 bg-black text-[#33ff33] font-mono rounded text-xp-micro select-none">AI CORE</span>
                    <span className="p-1 px-2 bg-blue-600 text-white font-mono rounded text-xp-micro select-none">HTML 4.0</span>
                  </div>
                </div>
              </div>
            );
          } else if (normalizedUrl.includes('google.com') || normalizedUrl.includes('search')) {
            return (
              <div className="flex flex-col items-center justify-center space-y-4 pt-6">
                <div className="text-3xl font-extrabold flex select-none tracking-tight">
                  <span className="text-blue-600">S</span>
                  <span className="text-red-600">u</span>
                  <span className="text-yellow-500">r</span>
                  <span className="text-blue-600">i</span>
                  <span className="text-green-600">y</span>
                  <span className="text-red-600">a</span>
                  <span className="text-sm font-bold text-neutral-400 self-end ml-1">Search</span>
                </div>
                <div className="w-full max-w-sm flex space-x-1">
                  <input
                    type="text"
                    placeholder="Search the web or ask retro computer trivia..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        browse(`http://search.com?q=${encodeURIComponent(searchQuery)}`);
                      }
                    }}
                    className="flex-1 border border-gray-400 px-2 py-1 text-xs outline-none bg-white text-black"
                  />
                  <button
                    onClick={() => browse(`http://search.com?q=${encodeURIComponent(searchQuery)}`)}
                    className="px-3 bg-neutral-200 border border-gray-400 text-xs font-semibold cursor-pointer py-1"
                  >
                    Search
                  </button>
                </div>

                <div className="text-center text-xp-body text-gray-500 pt-4">
                  {url.includes('?q=') ? (
                    <div className="bg-neutral-50 border border-gray-300 p-4 max-w-sm rounded text-left text-neutral-800 space-y-2 font-mono">
                      <p className="font-bold text-blue-900 flex items-center gap-1"><SafeIcon src="/assets/xp-icons/Search.png" className="w-4 h-4 object-contain flex-shrink-0" size={16} alt="" /> SURIYA_SEARCH_ENGINE RESULTS:</p>
                      <p className="text-xp-caption">Your query: "{decodeURIComponent(url.split('?q=')[1] || '')}"</p>
                      <p className="text-xp-body leading-relaxed text-emerald-800 font-sans">
                        Did you know? In 1998, deep neural networks were primarily localized academic experiments. SURIYA OS bridges 1998 nostalgic graphics with 2026 state-of-the-art transformer logic!
                      </p>
                      <button
                        onClick={() => {
                          browse(HOME);
                        }}
                        className="text-blue-600 hover:underline text-xp-caption block font-sans"
                      >
                        ← Back to Home
                      </button>
                    </div>
                  ) : (
                    <p>Search over 4,294,967,296 retro files indexed automatically.</p>
                  )}
                </div>
              </div>
            );
          } else {
            return (
              <div className="space-y-4 pt-6 text-center max-w-sm mx-auto">
                <SafeIcon src="/assets/xp-icons/Alert.png" className="w-12 h-12 mx-auto" size={48} alt="" />
                <h2 className="text-base font-bold text-red-600">404: Web Page Not Found</h2>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  Internet Explorer cannot open the page "{url}" because the remote server is not active or dial-up network connection was lost.
                </p>
                <button
                  onClick={() => {
                    browse(HOME);
                  }}
                  className="px-4 py-1.5 bg-neutral-200 border border-gray-400 text-xs font-semibold hover:bg-neutral-300 cursor-pointer rounded"
                >
                  Go to Portfolio Homepage
                </button>
              </div>
            );
          }
        })()}
      </div>

      {/* 5. AUTHENTIC WINDOWS XP IE6 STATUS BAR */}
      <div className="xp-statusbar flex items-center justify-between px-1.5 py-0.5 select-none text-xp-body">
        <div className="xp-statusbar-panel flex-1 flex items-center space-x-1.5 mr-1 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xp-glyph leading-none">✓</span>
          <span className="text-gray-700">Done</span>
        </div>
        <div className="xp-statusbar-panel flex items-center space-x-1 px-3">
          <SafeIcon src="/assets/xp-icons/Internet Explorer 6.png" className="w-3.5 h-3.5 object-contain" size={14} alt="" />
          <span className="text-gray-700">Internet</span>
        </div>
      </div>
    </div>
  );
}
