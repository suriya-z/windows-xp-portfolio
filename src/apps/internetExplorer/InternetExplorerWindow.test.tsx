import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderInShell } from '../../test/shell';
import InternetExplorerWindow from './InternetExplorerWindow';

const HOMEPAGE = "SURIYA'S SPACE AGE HOMEPAGE";

describe('Internet Explorer window', () => {
  it('goes Back to the homepage after a page is opened from Start > Search or Run', () => {
    const { rerender } = renderInShell(<InternetExplorerWindow id="internet_explorer" />);
    expect(screen.getByText(HOMEPAGE)).toBeInTheDocument();

    rerender(<InternetExplorerWindow id="internet_explorer" launch={{ url: 'http://google.com', seq: 1 }} />);
    expect(screen.queryByText(HOMEPAGE)).not.toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Back'));

    expect(screen.getByText(HOMEPAGE)).toBeInTheDocument();
  });

  it('goes Back from search results to the search page', () => {
    renderInShell(<InternetExplorerWindow id="internet_explorer" />);

    fireEvent.click(screen.getByTitle('Search'));
    fireEvent.change(screen.getByPlaceholderText(/Search the web/), { target: { value: 'reversi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByText(/Your query: "reversi"/)).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Back'));

    expect(screen.queryByText(/Your query/)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search the web/)).toBeInTheDocument();
  });
});
