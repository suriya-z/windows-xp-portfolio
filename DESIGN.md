# DESIGN.md — Windows XP Luna Design System Specification

## Overview
This design system defines the normative visual tokens, layout dimensions, elevation bevels, typography scales, and micro-interactions for the authentic Microsoft Windows XP (Luna Theme) operating system experience.

---

## 1. Typography System
Authentic Windows XP uses **Tahoma** across all system dialogs, menus, and controls.

Use these Tailwind classes (defined in `src/index.css` `@theme`) rather than arbitrary pixel sizes.

| Class | Size | Usage |
|---|---|---|
| `text-xp-glyph` | 8px | Arrow and chevron glyphs only (▲ ▼ ▶), never words |
| `text-xp-micro` | 9px | Badges and tiny labels |
| `text-xp-caption` | 10px | Address bar tags, secondary items, small print |
| `text-xp-body` | 11px | Menus, list views, dialogs, body UI (XP's 8pt Tahoma) |
| `text-xp-menu` | 11.5px | Start menu pinned program labels (bold) |
| `text-xp-heading` | 13px | Headings inside a window, contact name |
| `text-xp-start` | 15px | Taskbar "start" button (black italic) |

- **Title bars:** `.xp-titlebar-text`, Trebuchet MS bold 13px, as in Luna.
- **Font Family:** `'Tahoma', 'Segoe UI', Arial, sans-serif`
- **Monospace Fallback:** `'Lucida Console', 'Courier New', monospace` (Terminal / CMD only)

---

## 2. Color Palette & Semantic Tokens

### Core OS Chrome
- **Desktop Canvas:** `#5b8ce1` (or Bliss backdrop image)
- **3D Face (Dialog/Window Interior):** `#ece9d8` (`COLOR_3DFACE` / `COLOR_BTNFACE`)
- **Document Client Workspace:** `#ffffff` (Notepad, Wordpad, Explorer file lists)
- **Window Text:** `#000000`
- **Selection Highlight:** `#316ac5` (`COLOR_HIGHLIGHT`)
- **Selection Text:** `#ffffff` (`COLOR_HIGHLIGHTTEXT`)
- **Tooltip Background:** `#ffffdc` (Border: 1px solid `#000000`)
- **Explorer task-pane header:** `#215dc6` bold on `linear-gradient(to right, #ffffff, #d6dff7)`
- **Icons:** XP icons from `public/assets/xp-icons` only; no emoji or modern line icons in the chrome.

### Title Bar Gradients
- **Active Title Bar:** `linear-gradient(to bottom, #0058ee 0%, #3593ff 4%, #288eff 6%, #1279fd 8%, #0369f6 10%, #005dee 14%, #003dd6 60%, #003dd6 80%, #0053e5 95%, #0053e5 100%)`
  - Active Border: `1px solid #00138c`
  - Top highlight: `inset 0 1px 0 rgba(255, 255, 255, 0.5)`
- **Inactive Title Bar:** `linear-gradient(to bottom, #6f8fdf 0%, #8fa9ec 6%, #7d9be6 10%, #5271c6 20%, #4f6ec4 80%, #5271c6 100%)`. XP's own inactive blue (#7697e7) is lighter; this is darkened just enough for white caption text to reach 4.5:1.
  - Inactive Border: `1px solid #5a75be`

### Luna Taskbar & Start Button
- **Taskbar Background:** `linear-gradient(to bottom, #245edb 0%, #3f8cf3 9%, #245edb 18%, #245edb 92%, #1941a5 100%)`
  - Top Keyline: `1px solid #3880f7`
- **Start Button:** `linear-gradient(to bottom, #38821d 0%, #5cb838 10%, #43a325 35%, #358d1b 75%, #256a12 100%)`
  - Border: `1px solid #1e5c14`
  - Hover: `linear-gradient(to bottom, #439624 0%, #6ecc45 10%, #51b531 35%, #429f24 75%, #2c7c17 100%)`
  - Pressed: `translate(1px, 1px)` with inset shadow `rgba(0, 0, 0, 0.6)`
- **System Tray:** `linear-gradient(to bottom, #0c59b8 0%, #1369cf 15%, #115ebb 60%, #0d50a7 100%)`
  - Left Keyline: `1px solid #0d4692`

---

## 3. Elevation & 3D Bevels

| Surface | CSS Implementation | Visual Appearance |
|---|---|---|
| **Raised 3D Button** | `box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #808080, inset -2px -2px 0 #404040;` | Classic Windows tactile button |
| **Sunken 3D Well** | `box-shadow: inset 1px 1px 0 #404040, inset 2px 2px 0 #808080, inset -1px -1px 0 #fff;` | Depressed button / active tool |
| **Input Inset** | `border: 1px solid #7f9db9; box-shadow: inset 1px 1px 1px rgba(0,0,0,0.2);` | Form fields, search bars |
| **Window Frame** | `box-shadow: 2px 5px 16px rgba(0, 0, 0, 0.45); border-radius: 8px 8px 0 0;` | Luna rounded top corners |
| **Context Menu** | `box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.35); border: 1px solid #666666;` | Floating popup menu |
| **Tooltip** | `box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.35); border: 1px solid #000000;` | Pale yellow hover tip |

---

## 4. Key Component Dimensions
- **Taskbar Height:** `30px`
- **Title Bar Height:** `30px`, radius `8px 8px 0 0`
- **Window Controls:** `21px × 21px`, border-radius `3px`
- **Close Button:** Red gradient `#e5563a` to `#b31b02`, hover `#ff7d63` to `#c41800`
- **Start Menu Dimensions:** Width `420px`, Height `~460px`
- **Desktop Icons Grid:** `76px` wide cell on a `96px` pitch, 32px icon glyph (the original XP icon size)
- **Context Menu Items:** Padding `3px 20px 3px 24px`

---

## 5. Micro-Interactions & Animation Standards
- **Button Press:** `transform: translate(1px, 1px)` with inset shadow shift.
- **Window Minimize:** shrinks toward the window's own taskbar button (`translate` to the button, `scale(0.1)`) with `180ms cubic-bezier(0.4, 0, 0.2, 1)` and opacity fade.
- **Window Restore:** `scale(1) translateY(0)` with `180ms ease`.
- **Start Menu Slide:** `120ms cubic-bezier(0, 0, 0.2, 1)` vertical translation from 14px offset.
- **Marquee Selection:** Translucent box `#316ac5/25` with 1px border `#316ac5`.
- **Sound Mapping:** Tactile WAV audio feedback on startup, click, navigation, maximize, minimize, shutdown, and exclamation.
