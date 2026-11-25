import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MenuBar } from './MenuBar';

const renderMenus = (onNew = vi.fn()) =>
  render(
    <MenuBar
      menus={[
        { label: 'File', items: [{ label: 'New', onSelect: onNew }, 'separator', { label: 'Page Setup...' }] },
        { label: 'Help', items: [{ label: 'About' }] },
      ]}
    />,
  );

describe('menu bar', () => {
  it('runs a command from its menu and closes the menu', () => {
    const onNew = vi.fn();
    renderMenus(onNew);

    fireEvent.click(screen.getByRole('menuitem', { name: 'File' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'New' }));

    expect(onNew).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu', { name: 'File' })).not.toBeInTheDocument();
  });

  it('greys out commands that do nothing, as Windows does', () => {
    renderMenus();

    fireEvent.click(screen.getByRole('menuitem', { name: 'File' }));
    const pageSetup = screen.getByRole('menuitem', { name: 'Page Setup...' });
    fireEvent.click(pageSetup);

    expect(pageSetup).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('menu', { name: 'File' })).toBeVisible();
  });

  it('closes on Escape and gives focus back to the menu name', () => {
    renderMenus();
    const file = screen.getByRole('menuitem', { name: 'File' });

    fireEvent.click(file);
    fireEvent.keyDown(screen.getByRole('menu', { name: 'File' }), { key: 'Escape' });

    expect(screen.queryByRole('menu', { name: 'File' })).not.toBeInTheDocument();
    expect(file).toHaveFocus();
  });
});
