import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderInShell, testShell } from '../../test/shell';
import NotepadWindow from './NotepadWindow';

const choose = (menu: string, command: string) => {
  fireEvent.click(screen.getByRole('menuitem', { name: menu }));
  fireEvent.click(screen.getByRole('menuitem', { name: command }));
};

describe('Notepad window', () => {
  it('starts an empty Untitled document from File > New', () => {
    const shell = testShell();
    renderInShell(<NotepadWindow id="notepad" launch={{ file: 'RESUME.TXT', seq: 1 }} />, shell);

    choose('File', 'New');

    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(shell.setCaption).toHaveBeenLastCalledWith('notepad', 'Untitled - Notepad');
  });

  it('shows an About box from Help, not another program', () => {
    const shell = testShell();
    renderInShell(<NotepadWindow id="notepad" />, shell);

    choose('Help', 'About Notepad');

    expect(shell.showDialog).toHaveBeenCalledWith('About Notepad', expect.stringContaining('Notepad'), expect.any(String), 'info');
    expect(shell.open).not.toHaveBeenCalled();
  });

  it('turns Word Wrap off and on from the Format menu', () => {
    renderInShell(<NotepadWindow id="notepad" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('wrap', 'soft');

    fireEvent.click(screen.getByRole('menuitem', { name: 'Format' }));
    const wordWrap = screen.getByRole('menuitemcheckbox', { name: 'Word Wrap' });
    expect(wordWrap).toBeChecked();
    fireEvent.click(wordWrap);

    expect(screen.getByRole('textbox')).toHaveAttribute('wrap', 'off');
  });
});
