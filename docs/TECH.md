# Technical Architecture Document - Live Cam

<!-- ⚠️ CKM SEPARATION WARNING ⚠️ -->
<!-- TECH.md is for IMPLEMENTATION FOCUS (HOW) -->
<!-- DON'T include: Business rationale, project timeline, user requirements -->
<!-- For business context → see PRD.md -->
<!-- For timeline and planning → see PLAN.md -->

**Version:** 5.0
**Date:** 2026-07-19
**Technical Lead:** Jerzy Maczewski + Claude Code
**Stack:** Tauri v2 (Rust) + HTML/CSS/JS + GitHub Actions CI/CD

---

## System Architecture

### High-Level Architecture
Tauri v2 app — lightweight native window wrapper with a system webview:
- **Rust backend (Tauri)** — window management, build to .exe / .deb
- **Webview frontend** — WebView2 (Windows) / WebKitGTK (Linux); camera access (getUserMedia), UI rendering
- **Context menu** — custom HTML/JS menu on right-click

### Build Pipeline:
```
Dev (WSL2) → git push dev → GitHub Actions ┬ windows-latest → cargo tauri build --bundles nsis → live-cam.exe + setup.exe
                                           └ ubuntu-22.04  → cargo tauri build --bundles deb  → .deb
                                           → dev pre-release (updated automatically, all 3 artifacts)
Tag v* → stable GitHub Release (portable .exe + NSIS installer + .deb)
       → auto-notes replaced with handwritten changelog (gh release edit --notes-file)
```

### Runtime Data Flow:
```
enumerateDevices() → camera list → dropdown/menu → getUserMedia({deviceId}) → MediaStream → <video>
```

---

## Current Capabilities

- ✅ Tauri v2 with WebView2 (Windows) / WebKitGTK (Linux)
- ✅ Deferred camera discovery (user-initiated, no auto-detect on startup)
- ✅ Discover button (↻) with spin animation + dropdown click trigger
- ✅ Camera switching by keyboard: Space/Tab cycle, Shift+Tab reverse, 1–9 direct (works in borderless)
- ✅ Settings button (⚙) in toolbar + right-click context menu
- ✅ Context menu: fullscreen, hide toolbar, always on top, view shapes, resolution info
- ✅ Fullscreen: F11, F key, double-click (also in borderless mode), Esc to exit, context menu
- ✅ Hide toolbar mode: removes decorations + toolbar, drag via video (B key or context menu)
- ✅ View shapes: rectangle / circle / square, desktop cut-through in borderless (transparent window)
- ✅ Always on top: pin window above others (T key or context menu)
- ✅ Responsive toolbar (shrinks in narrow windows) + context menu clamped to window bounds
- ✅ Tauri v2 capabilities (window permissions)
- ✅ GitHub Actions CI/CD with dev pre-release (Windows + Linux artifacts)
- ✅ Path filter (only code changes trigger builds)
- ✅ Cargo cache including ~/.cargo/bin (Tauri CLI)
- ✅ Portable .exe (~8 MB) + NSIS installer + Linux .deb
- ✅ MIT License
- 🔲 Code signing via SignPath.io (pending OSS application)

---

## Technical Stack

### Frontend (WebView2):
- **Language:** JavaScript (ES6+), HTML5, CSS3
- **Camera API:** WebRTC getUserMedia / enumerateDevices
- **Styling:** Separate `style.css`, dark theme
- **Framework:** None — vanilla JS

### Backend (Rust/Tauri):
- **Framework:** Tauri v2.10
- **Window:** 960×540 default, resizable, min 320×240; created `transparent` + undecorated + shadowless + hidden, dressed and shown at startup (see Key Implementation Details)
- **Capabilities:** see `src-tauri/capabilities/default.json` — fullscreen, maximize, decorations, dragging, always-on-top, inner-size/set-size, show
- **Build output:** Portable .exe (~8 MB) + NSIS installer + Linux .deb

### CI/CD:
- **Platform:** GitHub Actions
- **Runners:** `windows-latest` (MSVC, WebView2) + `ubuntu-22.04` (WebKitGTK 4.1, .deb)
- **Trigger:** Push to `dev` (with path filter: `src/**`, `src-tauri/**`, `package.json`, `.github/workflows/**`) or tag `v*`
- **Cache:** `~/.cargo/registry`, `~/.cargo/git`, `~/.cargo/bin`, `src-tauri/target` (per runner OS)
- **Dev pre-release:** Updated automatically on every push to `dev` (tag `dev-latest`); accumulates assets of older versions — check file names/dates
- **Stable release:** Created on `v*` tags via `softprops/action-gh-release` with all three artifacts; tag builds use the workflow **from the tagged commit** (land CI fixes before tagging)

### Development:
- **Environment:** WSL2 (Linux) — `cargo tauri dev` with WebKit2GTK
- **Rust version:** 1.94+
- **Package Manager:** npm (frontend) + cargo (Tauri)

---

## Code Organization

```
live-cam/
├── CLAUDE.md                  # Claude Code instructions
├── README.md                  # End-user documentation
├── docs/
│   ├── PRD.md                 # Requirements (WHAT & WHY)
│   ├── PLAN.md                # Implementation plan (WHEN)
│   └── TECH.md                # Technical docs (HOW)
├── pics/                      # README screenshots
├── .github/workflows/
│   └── build.yml              # GitHub Actions workflow (Windows + Linux jobs)
├── .gitignore
├── package.json
├── src-tauri/
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── build.rs
│   ├── tauri.conf.json        # Window config, CSP, app metadata
│   ├── capabilities/
│   │   └── default.json       # Tauri v2 permissions (fullscreen)
│   ├── icons/
│   ├── gen/
│   └── src/
│       └── main.rs            # Minimal entry point
└── src/
    ├── index.html             # Layout: toolbar + video + context menu
    ├── style.css              # Dark theme
    └── main.js                # Camera logic, context menu, fullscreen
```

---

## Key Implementation Details

### Deferred Camera Discovery
Camera detection is **not** performed on app startup. This avoids antivirus (Norton) intercepting `getUserMedia` during process initialization, which caused driver crashes and black screens.

Discovery is triggered by:
1. **Discover button (↻)** — always available in toolbar
2. **Dropdown click** — triggers discovery on first use only (`mousedown` event, before dropdown opens)

A temporary `getUserMedia({video: true})` call is required first so WebView2 returns device labels. Without it, `enumerateDevices()` returns empty `label` fields. The temporary stream is stopped immediately.

The `devicechange` listener (hot-plug) is only registered **after** the first successful discovery, preventing background camera access before user interaction.

### Camera Switching Shortcuts
Keyboard switching without the toolbar — `Space`/`Tab` cycle forward, `Shift+Tab` back,
`1`–`9` jump to a position in `cameras[]`. Both paths call the existing `selectCamera()`,
which already syncs the dropdown, so there is no second code path for the stream.

Three collisions are handled explicitly:
- **Toolbar focus** — the shortcuts are gated on `document.activeElement === document.body`.
  While a control holds focus, `Space` and `Tab` keep their native meaning (activating a
  button, moving focus), which keyboard navigation of the toolbar depends on. In borderless
  mode `.toolbar` is `display: none`, so it is out of the focus order and the gate is always
  open. The gate sits **after** the existing F/T/B handlers so their behaviour is unchanged.
- **Auto-repeat** — a held key fires ~30 `keydown`/s; `e.repeat` is rejected, otherwise each
  event would stop the stream and re-enter `getUserMedia()` (flicker, `NotReadableError`).
- **Overlapping switches** — `selectCamera()` is async and only updates `currentDeviceId`
  once the new stream is live, so a second press would compute its target from stale state
  and run two `getUserMedia()` calls against the same device. A `switching` flag (released in
  `finally`, so a failed switch cannot wedge it) drops presses arriving mid-switch; they are
  not queued.

Index bounds (`i >= cameras.length`) cover both an out-of-range digit and the pre-discovery
state — with `cameras[]` empty every index is out of range, so the shortcuts stay silent and
never open a camera without user action, per Deferred Camera Discovery. Positions follow the
current `enumerateDevices()` order and shift on hot-plug; nothing is persisted (zero footprint).

### Video Constraints
High `ideal` values (4096×2160) request the camera's maximum supported resolution. Without `ideal`, getUserMedia defaults to 640×480. The camera provides the best it can — a 1080p camera gives 1080p, a 720p camera gives 720p:
```javascript
{ video: { deviceId: { exact: deviceId }, width: { ideal: 4096 }, height: { ideal: 2160 } } }
```

### Window Transparency at Creation (tauri#8632)
On Windows, a window created with decorations (or an undecorated shadow) **never becomes
transparent** — the capability is fixed at creation time and runtime setters don't restore it.
The window is therefore created with `transparent: true, decorations: false, shadow: false,
visible: false`; at startup `main.js` calls `setDecorations(true)` and then `show()`.
Do not "simplify" this config — it looks redundant but is load-bearing.
`shadow: false` stays permanent (it only affects undecorated windows on Windows; decorated
windows keep their native DWM frame shadow).

### View Shapes
Rectangle (default), Circle, Square — implemented purely in CSS + a body class, no Rust:
- Video is sized to the largest inscribed square via container query units
  (`min(100cqw, 100cqh)`; `.video-container` is a size container) with `object-fit: cover`
- Circle adds `clip-path: circle(closest-side)` — clip-path also clips mouse hit-testing,
  so dragging and double-click fullscreen work exactly inside the shape
- A no-op `filter: brightness(1)` keeps the video off hardware overlay planes, which
  can ignore clip-path
- In borderless mode body/container backgrounds turn transparent — the shape cuts through
  to the desktop; with the toolbar visible the shape sits on the black container background
- Selecting a shape snaps the window to a square (`innerSize` → `setSize`, physical px)
- All shape rules are gated with `:not(.fullscreen)` — fullscreen always shows the full frame
- Linux: cut-through requires a compositing WM; without one the corners degrade to black

### Settings / Context Menu
Single shared menu accessible via:
- **Settings button (⚙)** in toolbar — opens below button, toggles on click
- **Right-click** anywhere — opens at cursor position

Menu items:
- Fullscreen toggle
- Hide toolbar toggle
- Always on top toggle
- View shape: Rectangle / Circle / Square (active item marked)
- Resolution + FPS info (read-only, FPS rounded to integer)

Menu is shown off-screen first to measure its size, then coordinates are clamped to the
window bounds (`max(0, min(...))`); on very small windows the menu scrolls
(`max-height` + `overflow-y: auto`). In borderless mode, left-click on video dismisses
the menu before starting drag.

### Fullscreen
Multiple entry points, all calling the same `toggleFullscreen()`:
- **F11** key — standard fullscreen shortcut
- **F** key — alternative (F11 may be intercepted by WebView2)
- **Double-click** on video element — detected via `e.detail === 2` on `mousedown`, not the
  `dblclick` event: in borderless mode `startDragging()` hands the mouse to the native drag
  loop and the browser never fires `dblclick` (click counting survives on `mousedown`)
- **Context menu** → "Fullscreen" option
- **Esc** key — exits fullscreen

`toggleFullscreen()` also toggles a `fullscreen` class on `<body>`, which disables the
view-shape CSS for the duration of fullscreen.

Uses Tauri window API (`window.__TAURI__.window.getCurrentWindow().setFullscreen()`) with browser Fullscreen API as fallback. Requires `core:window:allow-set-fullscreen` capability in `capabilities/default.json`.

### Hide Toolbar (Borderless)
Removes Windows title bar (decorations) and hides the toolbar for a clean video-only view:
- **B** key — toggle shortcut
- **Context menu** → "Hide toolbar" / "Show toolbar"
- **Window dragging** — in borderless mode, left-click on video starts window drag via `startDragging()`
- Double-click fullscreen works in borderless mode too (see Fullscreen — `e.detail` detection)

Requires Tauri capabilities: `core:window:allow-set-decorations`, `core:window:allow-is-decorated`, `core:window:allow-start-dragging`.

### Always on Top
Pins the window above all other windows via `setAlwaysOnTop()`:
- **T** key — toggle shortcut
- **Context menu** → "Always on top" / "Always on top ✓"

Requires Tauri capabilities: `core:window:allow-set-always-on-top`, `core:window:allow-is-always-on-top`.

Note: Does not work in WSL2 (WSLg limitation) — works correctly in native Windows .exe builds.

### Device Change Listener
Registered only after first manual discovery (not on startup):
```javascript
if (!discovered) {
  discovered = true;
  navigator.mediaDevices.addEventListener("devicechange", listCameras);
}
```
Automatically refreshes camera list when devices are plugged in or removed.

---

## Zero Footprint Strategy

### Principle: Application writes NOTHING to disk

No configuration to persist — every start is "clean":
- Cameras detected live (may change between launches)
- Window size = fixed default (960×540)
- No localStorage, cookies, or config files

### Tauri + WebView2 Cache
Tauri creates a WebView2 User Data folder in `%LOCALAPPDATA%` by default.
Mitigation: redirect WebView2 data dir to `%TEMP%/live-cam-{random}/` — system cleans it automatically.

### Uninstall:
```
Delete live-cam.exe → done
```

---

## Git Workflow

### Branches:
- **`dev`** — default branch, CI/CD trigger, active development
- **`main`** — stable, updated via merge from `dev`

### Release Flow:
```bash
# Development
git push origin dev        # → build .exe → update dev pre-release

# Stabilize
git checkout main && git merge --ff-only dev && git push origin main

# Release
git tag -a v1.x.y -m "release title" && git push origin v1.x.y   # → stable GitHub Release (3 artifacts)
gh release edit v1.x.y --notes-file <changelog.md> --latest      # replace auto-notes
```

Version lives in **4 files**: `package.json`, `src-tauri/tauri.conf.json`,
`src-tauri/Cargo.toml`, `src-tauri/Cargo.lock` (easy to miss). Version 1.0.1 was
burned (bumped on dev, never released) — do not reuse.

---

## Known Issues

### Resolved:
- ~~`--bundles none` invalid on Windows~~ → using `--bundles nsis`
- ~~Fullscreen not working~~ → added Tauri capabilities + F key + dblclick
- ~~Resolution capped at 1080p~~ → removed constraint, camera provides native res
- ~~Black screen on first camera~~ → removed auto-select, deferred discovery
- ~~Norton blocking camera on startup~~ → deferred getUserMedia to user-initiated action
- ~~Double-click fullscreen dead in borderless mode~~ → `e.detail === 2` on `mousedown` (v1.0.2)
- ~~Window transparency broken on Windows~~ → window created undecorated + shadowless (v1.1.0, tauri#8632)
- ~~Toolbar buttons pushed out of narrow windows~~ → flex `min-width: 0` / `flex-shrink: 0` split (v1.1.0)
- ~~Context menu escaping small windows~~ → clamp to window bounds + scrollable menu (v1.1.0)

### Potential:
- **WebView2 Runtime** — required on target machine (pre-installed on Win 10 21H2+ / Win 11)
- **WebView2 User Data** — Tauri may create folder in `%LOCALAPPDATA%` (mitigation planned)
- **First CI build** — ~15 min (subsequent ~5 min with cache)
- **WSL2 testing (dev machine)** — WSL kernel 6.18.x randomly kills CI-built binaries at load
  (ld.so crash, ASLR-dependent, environment bug — not the app); test with `setarch -R live-cam`
- **Linux transparency** — desktop cut-through needs a compositing WM (default on major desktops)

---

## Build & Deployment

### Local Dev (WSL2):
```bash
source ~/.cargo/env
cargo tauri dev    # Runs with WebKit2GTK (no cameras on WSL2)
```

### Build Windows .exe (GitHub Actions):
```bash
git push origin dev    # Triggers build (only if code changed)
# → dev pre-release updated at: github.com/george7979/live-cam/releases/tag/dev-latest
```

### Download .exe via CLI:
```bash
gh run download --repo george7979/live-cam --name live-cam-windows --dir ./build
```

---

*This document serves as the single source of truth for technical implementation.*
