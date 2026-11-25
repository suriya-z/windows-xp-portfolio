# Windows XP (Luna) Interactive Web OS & AI Engineer Portfolio

A pixel-authentic, high-fidelity recreation of the classic Windows XP Luna desktop operating system, built as an interactive developer portfolio. It is a static site: no API keys or backend services are needed.

---

## Features & Highlights

- **Authentic Windows XP Luna Shell**:
  - Classic blue Luna gradient titlebars with fiery orange-red Close button hover/active states.
  - Glossy green Start button with sliding Start Menu flyouts.
  - Taskbar with rect-zoom window minimize/restore animations and active button 1px down-right tactile displacement.
  - Full 8-direction perimeter and corner window resize handles with textured 6-dot Luna corner grips.
  - Rubber-band desktop marquee selection with real-time geometric collision hit-testing.
  - Pale yellow `#ffffdc` Windows XP tooltips with hover delay.
  - Boot screen that lasts only as long as loading (any key or a click skips it); returning visitors go straight to the desktop.
  - Menu bars with working commands and greyed-out unavailable ones, as in XP; Help > About in every app.
  - Keyboard use: Escape closes menus, message boxes and Run; focus moves into a window when it opens.
- **Genuine Windows XP Audio Subsystem** (MP3, about 180 KB for every sound):
  - System sounds for Startup, Shutdown, Start Menu Clicks, Window Minimize, Restore, Recycle Bin Emptying, Errors, and Dialogs.
  - Web Audio fallback synthesizer for retro PC speaker beeps.
- **Built-in Desktop Applications**:
  - **My Computer / My Documents**: Directory navigation stack with Back/Forward history.
  - **My Projects**: Project browser with a simulation log.
  - **Contact Suriya**: E-mail, GitHub and LinkedIn links (set them in `src/os/profile.ts`).
  - **Notepad**: Text editor with live file browsing (`ABOUT_ME.TXT`, `RESUME.TXT`), File > Save As, Word Wrap and Time/Date.
  - **Paint**: Canvas drawing tool with pencil, brush, eraser, and bucket fill; File > Save As saves a PNG.
  - **Internet Reversi**: Full minigame with score tracking and win conditions.
  - **Calculator**: Authentic arithmetic calculation with memory registers.
  - **Date and Time**: Analog canvas clock with ticking second hand and digital readout.
  - **Control Panel**: XP category view with system, network, sound and security details.
  - **Internet Explorer 6**: Retro browser shell with navigation history.
  - **Recycle Bin**: Dynamic empty/full icon switching with authentic crunch sound.
  - **Run Dialog**: System command execution (`calc`, `notepad`, `paint`, `cmd`, etc.).
  - **System Dialog**: Error modal dialogs.

---

## Architecture Overview

```
deep-singularity/
├── src/
│   ├── apps/                  # One folder per program: its window, plus its engine and tests
│   │   ├── index.ts           # Which window each app id draws (every app must have one)
│   │   ├── calculator/        # calculator.ts: key presses in, display out
│   │   ├── explorer/          # My Computer, My Documents and Control Panel
│   │   ├── internetExplorer/  # Pages and Back/Forward, through os/history
│   │   ├── paint/             # floodFill.ts: the paint bucket, on plain pixel data
│   │   ├── reversi/           # reversi.ts: moves, passes, the computer player, the winner
│   │   ├── welcome/           # First-visit Welcome window: Resume, My Projects, Contact, and how to use the desktop
│   │   └── ...                # notepad, projects, contact, recycle, run, dialog, clock
│   ├── components/
│   │   ├── ClockCanvas.tsx    # Analog canvas clock component
│   │   ├── MenuBar.tsx        # A window's File/Edit/View... menus; commands without an action are greyed
│   │   ├── PopupMenu.tsx      # Drop-down and right-click menus with submenus and arrow keys
│   │   ├── SafeIcon.tsx       # XP icon renderer with image error fallbacks
│   │   └── XPLogo.tsx         # The Windows XP flag and lockup, used everywhere the logo appears
│   ├── desktop/               # The shell's parts: Desktop (icons, selection, right-click menu), WindowFrame,
│   │                          # StartMenu, Taskbar, BootScreen, LoginScreen
│   ├── os/
│   │   ├── apps.ts            # The app registry: titles, icons, sizes, Run names, menus, shortcuts
│   │   ├── download.ts        # Hands the visitor a file to save (File > Save As)
│   │   ├── drag.ts            # Pointer (mouse, pen, touch) dragging with pointer capture
│   │   ├── history.ts         # Back/Forward history shared by Explorer and Internet Explorer
│   │   ├── icons.ts           # Picks the 16px or 32px icon file for the drawn size
│   │   ├── profile.ts         # Your name, contact links, resume text and projects
│   │   ├── shell.tsx          # What an app window can ask of the desktop (open, close, dialogs)
│   │   ├── sound.ts           # The one volume gate; WAV system sounds and Web Audio tones
│   │   ├── startup.ts         # Boot screen timing and remembering a returning visitor
│   │   ├── windowManager.ts   # Open, focus, close, minimize, stacking order, resize limits
│   │   └── windowPlacement.ts # Window layout rules, including the phone layout
│   ├── types/
│   │   └── os.ts              # WindowState and system type definitions
│   ├── App.tsx                # Wires the shell together: boot, log-on, window manager, focus, Start menu, taskbar
│   ├── index.css              # XP Luna theme gradients, button displacement, animations
│   └── main.tsx               # Application root
├── public/
│   ├── assets/bliss.*         # The desktop wallpaper (AVIF, WebP, JPEG fallback)
│   ├── assets/xp-icons/       # XP icons at 16px and 32px (see its README for sources)
│   └── assets/xp-sounds/      # Windows XP system sounds as MP3
├── server.ts                  # Production Express server for the built site in dist/
├── vite.config.ts             # Vite dev server and build
└── package.json               # Cross-platform scripts and dependencies
```

---

## Quickstart

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### 1. Installation
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run the Tests
```bash
npm test
```

---

## Build & Production Deployment

- **Type Check**:
  ```bash
  npm run lint
  ```
- **Production Build**:
  ```bash
  npm run build
  ```
  *Compiles the site into `dist/` (any static host can serve it) and bundles the optional Express server into `dist/server.js` via esbuild.*
- **Run Production Server**:
  ```bash
  npm start
  ```
- **Clean Build Artifacts**:
  ```bash
  npm run clean
  ```
  *Cross-platform cleanup supported on Windows, macOS, and Linux.*
