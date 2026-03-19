# Live Cam

Minimalist camera viewer for Windows. One job: display your system camera feed.

## Download

Go to [Latest Release](https://github.com/george7979/live-cam/releases/latest) and pick:

- **`live-cam.exe`** — portable, no installation, just run it
- **`Live Cam ... x64-setup.exe`** — installer (adds Start Menu shortcut, Add/Remove Programs entry)

## Features

### Camera
- **Camera selection** — dropdown with all detected system cameras
- **Discover button** — manual camera detection (↻), no auto-scan on startup
- **Hot-plug** — detects cameras being plugged in or removed after first discovery

### Display
- **Live preview** — real-time video stream at camera's native resolution
- **Resizable window** — proportional scaling, maintains aspect ratio
- **Fullscreen** — F11 key, double-click, or settings menu
- **Hide toolbar** — borderless mode for clean video-only view, drag window by grabbing video
- **Always on top** — pin window above all others
- **Resolution info** — current resolution and FPS shown in settings menu

### Interface
- **Settings button** (⚙) — quick access to display options from toolbar
- **Right-click menu** — same settings menu, available anywhere including borderless mode
- **Keyboard shortcuts** — F11/F (fullscreen), B (borderless), T (always on top), Esc (exit)

### Design
- **Zero footprint** — no config files, no registry entries, delete .exe = full uninstall
- **Portable** — single .exe (~8 MB), no installation required
- **Dark theme** — easy on the eyes

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F11 | Toggle fullscreen |
| F   | Toggle fullscreen (alternative) |
| B   | Toggle hide toolbar (borderless) |
| T   | Toggle always on top |
| Esc | Exit fullscreen / close context menu |

## Code Signing (planned)

> **Note:** Code signing is not yet active. The app currently ships unsigned — Windows SmartScreen may show a warning on first run. We plan to add free code signing through SignPath.io in a future release.

Free code signing provided by [SignPath.io](https://about.signpath.io/), certificate by [SignPath Foundation](https://signpath.org/).

The app is open-source — you can inspect the [full source code](https://github.com/george7979/live-cam) and the [build pipeline](.github/workflows/build.yml) that produces the .exe.

## Requirements

- Windows 10 (21H2+) or Windows 11

## License

MIT
