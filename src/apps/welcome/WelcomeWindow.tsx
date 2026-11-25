import { SafeIcon } from '../../components/SafeIcon';
import { appIcon, type AppId } from '../../os/apps';
import { profile } from '../../os/profile';
import { useShell, type AppProps, type LaunchArgs } from '../../os/shell';

const PLACES: { label: string; detail: string; opens: AppId; args?: LaunchArgs }[] = [
  { label: 'Resume', detail: 'Experience and education', opens: 'notepad', args: { file: 'RESUME.TXT' } },
  { label: 'My Projects', detail: 'What I have built', opens: 'my_projects' },
  { label: 'Contact', detail: 'E-mail and links', opens: 'contact' },
];

/** Shown at a first log-on (and from Help): who this is, the three places worth opening, and how the desktop works. */
export default function WelcomeWindow({ id }: AppProps) {
  const shell = useShell();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#ece9d8] text-black font-sans text-xp-body p-3 space-y-3 select-text">
      <div className="flex items-center space-x-3">
        <SafeIcon src="/assets/xp-icons/Tour XP.png" className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
        <div>
          <div className="font-bold text-xp-heading text-[#003399]">Welcome to {profile.name}&apos;s desktop</div>
          <div className="text-neutral-700">{profile.role}</div>
        </div>
      </div>

      <div className="flex flex-col space-y-1.5">
        {PLACES.map((place, i) => (
          <button
            key={place.label}
            data-autofocus={i === 0 ? true : undefined}
            onClick={() => {
              shell.open(place.opens, place.args);
              shell.close(id);
            }}
            className="xp-btn flex items-center space-x-2.5 text-left px-2 py-1.5"
          >
            <SafeIcon src={appIcon(place.opens)} className="w-6 h-6 object-contain flex-shrink-0" size={24} alt="" />
            <span className="flex flex-col">
              <span className="font-bold">{place.label}</span>
              <span className="text-xp-caption text-neutral-600">{place.detail}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="text-neutral-700 leading-snug">
        Tip: double-click an icon on the desktop to open it (tap once on a phone). Everything here is also in the{' '}
        <span className="font-bold">start</span> menu.
      </p>
    </div>
  );
}
