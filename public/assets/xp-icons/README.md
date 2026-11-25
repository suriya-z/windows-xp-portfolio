# XP icons

Every icon exists twice: `16/<Name>.png` and `32/<Name>.png`. `SafeIcon` picks the folder from
the size the icon is drawn at (`src/os/icons.ts`), so reference an icon as
`/assets/xp-icons/<Name>.png` and pass the right `size`.

`src/os/icons.test.ts` fails if the app references an icon that is missing from either folder.

## Where the files come from

**Original Windows XP icons** (from the public repo github.com/ShizukuIchi/winXP,
`src/assets/windowsIcons`). Where only one size existed, the other was scaled from it.

CD-ROM, Calculator, Command Prompt, Control Panel, Critical, Default Programs, Favorites,
Folder Closed, Help and Support, IE Home, IE Refresh, IE Stop, Internet Explorer 6, Local Disk,
Logout, MSN Messenger, My Computer, My Documents, My Music, My Pictures, My Projects,
Network Connection, Network Connections, Network Places, Notepad, Outlook Express, Paint, Power,
Printer, Printers and Hardware, Recent Documents, Recycle Bin (empty), Run, Search,
Security Center, Security Error, Shared Documents, Spider Solitaire, Start Menu Programs,
System Information, Volume, Windows Messenger.

**Redrawn pack, scaled down** (no original was available; taken from the 1024px pack that is
still in `assets/xp-icons/` at the repo root):

Accessibility Wizard, Add or Remove Windows Components, Alert, Appearance, Connection Status,
Date and Time, Delete Internet History, Desktop, Floppy Disk, Folder View, Game Controller,
Generic Video, Internet Reversi, Performance, Recycle Bin (full), User Accounts.

The icons are Microsoft's artwork.

**Scaled from the full-size XP icon set** that was kept in the repo's old root `assets/xp-icons/` (see git history before commit df4a105): Folder Options, Folder View - Classic, Generic Text Document, Sharing Hand, Tour XP, Windows Update.
