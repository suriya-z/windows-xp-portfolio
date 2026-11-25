# AGENTS.md

Instructions and context for AI coding agents operating on this repository.

## Project Overview

Authentic Windows XP (Luna desktop) interactive web application and OS simulation.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide icons.
- **Backend**: none needed; the site is static. `server.ts` is an optional Express server for the built `dist/`.
- **Assets**: Windows XP sound library (MP3) in `public/assets/xp-sounds/` and retro icons in `public/assets/xp-icons/`.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context layout (`GLOSSARY.md` + `docs/adr/`). See `docs/agents/domain.md`.
