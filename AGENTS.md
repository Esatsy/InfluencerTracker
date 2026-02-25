# Influencer Tracker

Electron + React desktop/web app for tracking social media influencers. Single-package TypeScript codebase using `electron-vite`.

## Cursor Cloud specific instructions

### Architecture

- **Main process** (`src/main/`): Electron main + Express API server on port 3001 + SQLite (better-sqlite3)
- **Renderer** (`src/renderer/`): React SPA served by Vite dev server (typically port 5173)
- **Preload** (`src/preload/`): Electron bridge

### Running in dev mode

Standard commands are in `package.json` and `README.md`. Key notes:

- `npm run dev` launches `electron-vite dev` which starts both the Electron window and Vite dev server.
- On headless VMs, Electron requires a virtual display. Start Xvfb first:
  ```
  Xvfb :99 -screen 0 1280x720x24 &
  export DISPLAY=:99
  ```
- D-Bus errors in logs (`Failed to connect to the bus`) are harmless on headless environments and do not affect functionality.
- The API server (port 3001) and Vite dev server (port 5173) can be tested independently via `curl` or browser.

### Database

SQLite is fully embedded via `better-sqlite3`. No external database setup required. The DB file is created automatically on first run in Electron's `userData` directory.

### Lint / Test / Build

- **Build**: `npm run build` (runs `electron-vite build`)
- **Lint/Test**: No dedicated lint or test scripts are configured in the project. TypeScript type-checking happens during the build step.
- The `postinstall` script runs `electron-builder install-app-deps` to rebuild native modules for Electron.

### No external services required

All functionality works locally. Social media scraping endpoints (Instagram, TikTok, YouTube) degrade gracefully if external APIs are unreachable.
