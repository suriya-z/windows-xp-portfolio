import { SuriyaBrand } from '../components/SuriyaBrand';
import { profile } from '../os/profile';

/** The black boot screen with the XP logo; a click (or, handled by the caller, any key) skips it. */
export default function BootScreen({ onSkip }: { onSkip: () => void }) {
  return (
    <div
      onClick={onSkip}
      className="absolute inset-0 bg-black flex flex-col items-center justify-center z-[999999] cursor-pointer"
    >
      {/* Logo container */}
      <div className="flex flex-col items-center select-none">
        <SuriyaBrand />

        {/* Subtitle */}
        <div className="text-center mt-1 select-none">
          <span className="text-white text-sm italic tracking-[0.2em] uppercase font-light opacity-90" style={{ fontStyle: 'italic', fontFamily: 'sans-serif' }}>
            {profile.role}
          </span>
        </div>

        {/* Progress loading bar */}
        <div className="mt-14 select-none">
          <div className="w-[180px] h-[14px] rounded-full border border-neutral-600 bg-[#070707] p-[2px] relative overflow-hidden">
            <div className="absolute top-[2px] bottom-[2px] flex space-x-[2px] animate-xp-loader">
              <div className="w-2.5 h-full bg-gradient-to-b from-[#3a83fc] via-[#5fa1ff] to-[#043fa3] rounded-[1px] shadow-[0_0_4px_#3a83fc]"></div>
              <div className="w-2.5 h-full bg-gradient-to-b from-[#3a83fc] via-[#5fa1ff] to-[#043fa3] rounded-[1px] shadow-[0_0_4px_#3a83fc]"></div>
              <div className="w-2.5 h-full bg-gradient-to-b from-[#3a83fc] via-[#5fa1ff] to-[#043fa3] rounded-[1px] shadow-[0_0_4px_#3a83fc]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-left: "For the best experience..." */}
      <div className="absolute bottom-6 left-8 text-left font-sans select-none pointer-events-none opacity-85 hidden sm:block">
        <div className="text-xp-caption text-neutral-400 font-light tracking-wide leading-tight">For the best experience</div>
        <div className="text-xp-body text-white font-normal tracking-wide leading-tight">Enter Full Screen (F11)</div>
      </div>

      {/* Bottom-centre: how to skip */}
      <div className="absolute bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 text-xp-body text-neutral-400 font-sans tracking-wide select-none pointer-events-none whitespace-nowrap">
        <span className="sm:hidden">Tap to skip</span>
        <span className="hidden sm:inline">Press any key or click to skip</span>
      </div>


    </div>
  );
}
