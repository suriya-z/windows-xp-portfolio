import { useEffect, useRef, useState } from 'react';
import { MenuBar } from '../../components/MenuBar';
import { appIcon } from '../../os/apps';
import { downloadFile } from '../../os/download';
import { profile } from '../../os/profile';
import { showAbout, showHelpAndSupport, useShell, type AppProps } from '../../os/shell';

const DEFAULT_DOCUMENT = 'ABOUT_ME.TXT';
const UNTITLED = 'Untitled';

/** Notepad's Time/Date stamp, e.g. "6:07 PM 11/21/2026". */
const timeDate = (d = new Date()) =>
  `${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} ${d.toLocaleDateString('en-US')}`;

/** Notepad, opened on one of the profile documents. */
export default function NotepadWindow({ id, launch }: AppProps) {
  const shell = useShell();
  const firstDocument = launch?.file ?? DEFAULT_DOCUMENT;
  const [documentName, setDocumentName] = useState(firstDocument);
  const [text, setText] = useState(profile.files[firstDocument] ?? '');
  const [edits, setEdits] = useState(0);
  const [wordWrap, setWordWrap] = useState(true);
  const [statusBar, setStatusBar] = useState(true);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Opening a document while Notepad is already open replaces what it shows.
  useEffect(() => {
    const file = launch?.file;
    if (!file || profile.files[file] === undefined) return;
    setDocumentName(file);
    setText(profile.files[file]);
    setEdits(0);
  }, [launch?.seq]);

  useEffect(() => shell.setCaption(id, `${documentName} - Notepad`), [documentName]);

  const insertTimeDate = () => {
    const editor = editorRef.current;
    const at = editor?.selectionStart ?? text.length;
    const end = editor?.selectionEnd ?? at;
    setText(text.slice(0, at) + timeDate() + text.slice(end));
    setEdits((n) => n + 1);
  };

  return (

    <div className="flex-1 flex flex-col h-full bg-[#ece9d8] font-sans text-xs select-none">
      <MenuBar
        menus={[
          {
            label: 'File',
            items: [
              {
                label: 'New',
                onSelect: () => {
                  setDocumentName(UNTITLED);
                  setText('');
                  setEdits(0);
                },
              },
              {
                label: 'Save As...',
                onSelect: () => {
                  const name = documentName === UNTITLED ? 'Untitled.txt' : documentName;
                  downloadFile(name, new Blob([text], { type: 'text/plain' }));
                },
              },
              'separator',
              { label: 'Page Setup...' },
              { label: 'Print...' },
              'separator',
              { label: 'Exit', onSelect: () => shell.close(id) },
            ],
          },
          {
            label: 'Edit',
            items: [
              { label: 'Undo' },
              'separator',
              { label: 'Cut' },
              { label: 'Copy' },
              { label: 'Paste' },
              'separator',
              {
                label: 'Select All',
                onSelect: () => {
                  editorRef.current?.focus();
                  editorRef.current?.select();
                },
              },
              { label: 'Time/Date', onSelect: insertTimeDate },
            ],
          },
          {
            label: 'Format',
            items: [{ label: 'Word Wrap', checked: wordWrap, onSelect: () => setWordWrap(!wordWrap) }, { label: 'Font...' }],
          },
          { label: 'View', items: [{ label: 'Status Bar', checked: statusBar, onSelect: () => setStatusBar(!statusBar) }] },
          {
            label: 'Help',
            items: [
              { label: 'Help Topics', onSelect: () => showHelpAndSupport(shell) },
              'separator',
              { label: 'About Notepad', onSelect: () => showAbout(shell, 'Notepad', appIcon('notepad')) },
            ],
          },
        ]}
      />

      {/* Text editor work area with 3D inset border */}
      <div className="flex-1 p-0 bg-white border border-[#7f9db9] m-0.5 shadow-inner overflow-hidden flex flex-col">
        <textarea
          ref={editorRef}
          value={text}
          wrap={wordWrap ? 'soft' : 'off'}
          onChange={(e) => {
            setText(e.target.value);
            setEdits(p => p + 1);
          }}
          aria-label={documentName}
          className="flex-1 w-full p-2 text-xs font-mono resize-none border-none outline-none focus:ring-0 text-black leading-relaxed bg-white selection:bg-[#316ac5] selection:text-white"
          placeholder="Type notes here..."
        />
      </div>

      {/* Authentic Windows XP Multi-panel Status Bar */}
      {statusBar && (
        <div className="xp-statusbar flex items-center justify-between px-1 py-0.5 select-none">
          <div className="xp-statusbar-panel flex-1 truncate mr-1">
            <span>Doc: {documentName}</span>
          </div>
          <div className="xp-statusbar-panel w-28 text-right">
            <span>Edits: {edits}</span>
          </div>
        </div>
      )}
    </div>
  );
}
