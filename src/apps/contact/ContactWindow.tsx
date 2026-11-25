import { SafeIcon } from '../../components/SafeIcon';
import { contactLinks, profile } from '../../os/profile';
import { useShell } from '../../os/shell';

/** Contact: the profile's e-mail and web links. */
export default function ContactWindow() {
  const shell = useShell();

  return (

    <div className="flex-1 flex flex-col h-full bg-[#ece9d8] text-black font-sans text-xp-body p-3 space-y-3">
      <div className="flex items-center space-x-3">
        <SafeIcon src="/assets/xp-icons/Outlook Express.png" className="w-8 h-8 object-contain flex-shrink-0" size={32} alt="" />
        <div>
          <div className="font-bold text-xp-heading">{profile.name}</div>
          <div className="text-neutral-600">{profile.role}</div>
        </div>
      </div>
      <div className="flex-1 bg-white xp-bevel-inset p-3 space-y-2 overflow-auto select-text">
        {contactLinks(profile.contact).length === 0 && (
          <p className="text-neutral-600">Contact details have not been added yet.</p>
        )}
        {contactLinks(profile.contact).map((link) => (
          <div key={link.label} className="flex items-baseline space-x-2">
            <span className="w-16 text-neutral-600 flex-shrink-0">{link.label}:</span>
            <a href={link.href} target="_blank" rel="noreferrer" className="text-[#0000ff] underline break-all">{link.text}</a>
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-2">
        <button onClick={() => shell.close('contact')} className="xp-btn">Close</button>
      </div>
    </div>
  );
}
