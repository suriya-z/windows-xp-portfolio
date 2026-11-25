import { SafeIcon } from '../../components/SafeIcon';
import { appIcon } from '../../os/apps';
import { useShell } from '../../os/shell';

/** Recycle Bin: a few deleted files, until it is emptied. */
export default function RecycleBinWindow() {
  const shell = useShell();

  return (

    <div className="flex-1 flex flex-col h-full bg-neutral-100 text-black font-mono text-xs select-none p-3 justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-black pb-2">
          <span className="font-bold flex items-center space-x-1.5">
            <SafeIcon
              src={appIcon('recycle', { recycleEmpty: shell.recycleEmpty })}
              className="w-5 h-5 object-contain"
              size={20}
              alt="Recycle Bin"
            />
            <span>Recycle Bin Contents</span>
          </span>
          <button
            onClick={shell.emptyRecycleBin}
            disabled={shell.recycleEmpty}
            className="px-2 py-0.5 border border-black text-xp-caption bg-white hover:bg-neutral-200 disabled:opacity-50 font-bold cursor-pointer"
          >
            Empty Recycle Bin
          </button>
        </div>
        {shell.recycleEmpty ? (
          <div className="text-center text-neutral-500 py-8 italic">
            There are no deleted items in the Recycle Bin.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-1 hover:bg-neutral-200">
              <SafeIcon src="/assets/xp-icons/Security Error.png" className="w-4 h-4" size={16} />
              <span>compiler_warning_0x1337.tmp (4.2 KB)</span>
            </div>
            <div className="flex items-center space-x-2 p-1 hover:bg-neutral-200">
              <SafeIcon src="/assets/xp-icons/Alert.png" className="w-4 h-4" size={16} />
              <span>legacy_css_hack_for_ie6.txt (1.1 KB)</span>
            </div>
            <div className="flex items-center space-x-2 p-1 hover:bg-neutral-200">
              <SafeIcon src="/assets/xp-icons/Game Controller.png" className="w-4 h-4" size={16} />
              <span>productivity_distraction.lnk (0.5 KB)</span>
            </div>
          </div>
        )}
      </div>
      <div className="text-xp-micro text-neutral-400 text-right">
        Space used: {shell.recycleEmpty ? "0 KB" : "5.8 KB"}
      </div>
    </div>
  );
}
