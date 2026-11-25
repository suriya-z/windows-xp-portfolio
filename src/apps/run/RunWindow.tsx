import { useState } from 'react';
import { SafeIcon } from '../../components/SafeIcon';
import { parseRunCommand } from '../../os/apps';
import { sound } from '../../os/sound';
import { useShell } from '../../os/shell';

/** Start > Run: opens a program or web address by name. */
export default function RunWindow() {
  const shell = useShell();
  const [text, setText] = useState('');

  const run = () => {
    if (!text.trim()) return;
    const result = parseRunCommand(text);
    if (!result) {
      shell.showDialog(
        'Run',
        `Windows cannot find '${text.trim()}'. Make sure you typed the name correctly, and then try again.`,
        '/assets/xp-icons/Critical.png',
      );
      return;
    }
    sound.beep(800, 45, 'sine');
    if ('open' in result) shell.open(result.open);
    else shell.open('internet_explorer', { url: result.browse });
    shell.close('run_cmd');
    setText('');
  };

  return (

    <div className="flex-1 flex flex-col h-full bg-neutral-100 text-black font-sans text-xs select-none p-3.5 justify-between">
      <div className="flex space-x-3.5 items-start">
        <SafeIcon
          src="/assets/xp-icons/Run.png"
          className="w-8 h-8 object-contain flex-shrink-0"
          size={32}
          alt="Run"
        />
        <div className="flex-1 space-y-2.5">
          <p className="text-xp-body leading-relaxed text-black font-sans">
            Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-xp-body font-sans">Open:</span>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  run();
                }
              }}
              className="flex-1 xp-input px-2 py-0.5 text-xs select-text text-black"
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 border-t border-[#d4d0c8] pt-2.5 mt-2">
        <button
          onClick={run}
          className="xp-btn font-bold"
        >
          OK
        </button>
        <button
          onClick={() => shell.close('run_cmd')}
          className="xp-btn"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setText('projects');
            sound.beep(500, 30, 'sine');
          }}
          className="xp-btn"
        >
          Browse...
        </button>
      </div>
    </div>
  );
}
