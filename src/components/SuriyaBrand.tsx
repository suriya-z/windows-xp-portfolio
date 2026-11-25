import { XPLogo } from './XPLogo';
import { profile } from '../os/profile';

/** The boot and login lockup: the flag, the owner's name and the "xp" mark, so no Microsoft wordmark is shown. */
export function SuriyaBrand({ size = 'lg' }: { size?: 'md' | 'lg' }) {
  const large = size === 'lg';
  return (
    <div className="flex flex-col items-center select-none" role="img" aria-label={`${profile.name} xp`}>
      <XPLogo className={large ? 'w-36 h-auto' : 'w-28 h-auto'} />
      <div className="flex items-start mt-3">
        <span className={`text-white font-semibold tracking-tight font-sans ${large ? 'text-5xl' : 'text-4xl'}`}>{profile.name}</span>
        <span className="text-[#f1521d] text-2xl font-bold ml-1 mt-0.5 font-sans">xp</span>
      </div>
    </div>
  );
}
