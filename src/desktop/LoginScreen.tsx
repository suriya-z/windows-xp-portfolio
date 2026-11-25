import { SuriyaBrand } from '../components/SuriyaBrand';
import { profile } from '../os/profile';

/** The XP Welcome screen: one user tile to log on, and Restart. */
export default function LoginScreen({
  isLoggingOn,
  onLogOn,
  onRestart,
}: {
  isLoggingOn: boolean;
  onLogOn: () => void;
  onRestart: () => void;
}) {
  return (
    <div
      className={`absolute inset-0 flex flex-col justify-between z-[99999] font-sans transition-all duration-1000 select-none ${isLoggingOn ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'}`}
      style={{
        background: 'linear-gradient(to bottom, #003399 0%, #003399 10%, #6487DC 10%, #6487DC 90%, #003399 90%, #003399 100%)',
      }}
    >
      {/* Top blue bar */}
      <div className="h-[10%] w-full bg-[#003399] relative flex items-end">
        <div className="w-full h-[4px] bg-gradient-to-r from-[#ff9a00] via-[#ffbe00] to-[#ff9a00]"></div>
      </div>

      {/* Middle workspace */}
      <div className="flex-1 w-full flex items-center justify-center relative xp-login-grid">
        <div className="w-full max-w-4xl px-8 flex flex-col md:flex-row items-center justify-center md:space-x-12 relative">

          {/* Left Side: XP Brand */}
          <div className="flex flex-col items-center text-center md:items-end md:text-right md:w-1/2 pr-0 md:pr-12 border-b md:border-b-0 md:border-r border-white/20 pb-8 md:pb-0">
            <SuriyaBrand size="md" />
            <span className="text-[#cbdcf7] text-xs uppercase tracking-[0.2em] font-medium mt-1">{profile.role}</span>

            <p className="text-white/80 text-sm mt-8 font-light italic tracking-wide max-w-xs leading-snug">
              To begin, click on {profile.name} to log in
            </p>
          </div>

          {/* Right Side: User Account card */}
          <div className="md:w-1/2 pl-0 md:pl-12 pt-8 md:pt-0 flex flex-col justify-center">
            <button
              onClick={onLogOn}
              className="group flex items-center space-x-4 p-3 rounded-lg border border-transparent hover:border-white/30 hover:bg-white/10 active:scale-98 transition-all cursor-pointer text-left w-full max-w-sm"
            >
              <div className="relative w-18 h-18 bg-[#154dbd] p-[3px] rounded-md border-2 border-[#154dbd] shadow-md group-hover:border-[#ff9a00] group-hover:scale-105 transition-all overflow-hidden flex items-center justify-center">
                <div className="w-full h-full rounded bg-sky-400 overflow-hidden relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full select-none">
                    <defs>
                      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ba1ec" />
                        <stop offset="60%" stopColor="#87c7f3" />
                        <stop offset="100%" stopColor="#b4e1fc" />
                      </linearGradient>
                      <linearGradient id="greenHills" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#79b71b" />
                        <stop offset="100%" stopColor="#488607" />
                      </linearGradient>
                      <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffdbb5" />
                        <stop offset="100%" stopColor="#f5be8a" />
                      </linearGradient>
                      <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5c381c" />
                        <stop offset="100%" stopColor="#2c1706" />
                      </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="100" height="100" fill="url(#skyGrad)" />
                    <circle cx="25" cy="30" r="12" fill="#ffffff" opacity="0.45" />
                    <circle cx="35" cy="30" r="10" fill="#ffffff" opacity="0.45" />
                    <circle cx="15" cy="33" r="8" fill="#ffffff" opacity="0.3" />
                    <circle cx="75" cy="22" r="14" fill="#ffffff" opacity="0.35" />
                    <circle cx="85" cy="22" r="10" fill="#ffffff" opacity="0.35" />
                    <path d="M-10,105 C20,70 50,85 110,75 L110,110 L-10,110 Z" fill="url(#greenHills)" />
                    <path d="M40,105 C60,82 80,95 120,80 L120,110 L40,110 Z" fill="#6ba713" opacity="0.6" />
                    <path d="M15,100 C15,85 30,78 50,78 C70,78 85,85 85,100 Z" fill="#f1684c" />
                    <path d="M42,78 L50,87 L58,78 Z" fill="url(#skin)" />
                    <rect x="44" y="68" width="12" height="12" fill="url(#skin)" />
                    <circle cx="50" cy="52" r="18" fill="url(#skin)" />
                    <path d="M30,50 C28,34 38,22 50,22 C62,22 72,34 70,50 C74,48 74,42 72,38 C68,26 32,26 28,38 C26,42 26,48 30,50 Z" fill="url(#hair)" />
                    <circle cx="32" cy="54" r="5" fill="url(#hair)" />
                    <circle cx="68" cy="54" r="5" fill="url(#hair)" />
                    <circle cx="43" cy="48" r="2.5" fill="#2c1706" />
                    <circle cx="57" cy="48" r="2.5" fill="#2c1706" />
                    <rect x="36" y="44" width="12" height="8" rx="2" fill="none" stroke="#1c1c1c" strokeWidth="2" />
                    <rect x="52" y="44" width="12" height="8" rx="2" fill="none" stroke="#1c1c1c" strokeWidth="2" />
                    <line x1="48" y1="48" x2="52" y2="48" stroke="#1c1c1c" strokeWidth="2.5" />
                    <path d="M38,58 C41,56 46,56 50,58 C54,56 59,56 62,58 C65,60 61,64 50,64 C39,64 35,60 38,58 Z" fill="#3c220f" />
                    <path d="M46,65 Q50,68 54,65" fill="none" stroke="#f1684c" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-2xl font-semibold tracking-wide group-hover:text-[#ffbe00] group-hover:underline transition-colors leading-tight">
                  {profile.name}
                </span>
                <span className="text-[#cbdcf7] text-xs font-normal opacity-90 group-hover:text-white transition-colors mt-0.5">
                  {profile.role}
                </span>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Bottom blue bar */}
      <div className="h-[10%] w-full bg-[#002e9c] relative flex flex-col justify-end">
        <div className="w-full h-[4px] bg-gradient-to-r from-[#ff9a00] via-[#ffbe00] to-[#ff9a00]"></div>
        <div className="flex-1 px-8 py-2 flex items-center justify-between">
          <button
            onClick={onRestart}
            className="flex items-center space-x-2 text-white/80 hover:text-white group transition-colors cursor-pointer p-2 rounded hover:bg-white/5 active:scale-95"
          >
            <span className="w-6 h-6 rounded-full bg-red-600 border border-white/40 flex items-center justify-center text-white shadow-md group-hover:bg-red-500 group-hover:scale-105 transition-all">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
              </svg>
            </span>
            <span className="text-xs font-medium tracking-wide">Restart</span>
          </button>

          <p className="text-xp-body text-[#cbdcf7]/80 text-right font-light leading-relaxed max-w-sm pointer-events-none">
            After you log on, the system's yours to explore.<br />
            <span className="text-white/60">Every detail has been designed with a purpose.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
