import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderInShell, testShell } from '../../test/shell';
import ProjectsWindow from '../projects/ProjectsWindow';
import ExplorerWindow from './ExplorerWindow';

describe('My Documents', () => {
  it('has a folder for each project that opens that project in My Projects', () => {
    const shell = testShell();
    renderInShell(<ExplorerWindow id="my_documents" />, shell);

    fireEvent.doubleClick(screen.getByText('EDGE-VISION TPU'));

    expect(shell.open).toHaveBeenCalledWith('my_projects', { project: 'edgevision' });
  });
});

describe('My Projects', () => {
  it('shows the project it was opened on', () => {
    renderInShell(<ProjectsWindow id="my_projects" launch={{ project: 'edgevision', seq: 1 }} />);

    expect(screen.getByRole('heading', { name: 'EDGE-VISION TPU' })).toBeInTheDocument();
  });
});
