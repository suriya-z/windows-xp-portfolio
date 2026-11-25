import { SafeIcon } from '../../components/SafeIcon';
import { useShell } from '../../os/shell';

/** The system message box: shows whatever the last shell.showDialog() asked for. */
export default function SystemDialogWindow() {
  const shell = useShell();

  return (

    <div className="flex-1 flex flex-col h-full bg-[#ece9d8] text-black font-sans text-xs select-none p-3.5 justify-between">
      <div className="flex space-x-3.5 items-start">
        <SafeIcon
          src={shell.dialog.icon}
          className="w-9 h-9 object-contain flex-shrink-0 mt-0.5"
          size={36}
          alt="System Notice"
        />
        <div className="text-xp-body leading-relaxed font-sans text-neutral-800 whitespace-pre-line flex-1 select-text">
          {shell.dialog.message}
        </div>
      </div>
      <div className="flex justify-end pt-3">
        <button
          data-autofocus
          onClick={() => shell.close('error_dialog')}
          className="xp-btn font-bold px-6"
        >
          OK
        </button>
      </div>
    </div>
  );
}
