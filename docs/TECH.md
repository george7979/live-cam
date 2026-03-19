# Technical Architecture Document - Live Cam

<!-- ⚠️ CKM SEPARATION WARNING ⚠️ -->
<!-- TECH.md is for IMPLEMENTATION FOCUS (HOW) -->
<!-- DON'T include: Business rationale, project timeline, user requirements -->
<!-- For business context → see PRD.md -->
<!-- For timeline and planning → see PLAN.md -->

**Version:** 4.0
**Date:** 2026-03-19
**Technical Lead:** Jerzy Maczewski + Claude Code
**Stack:** Tauri v2 (Rust) + HTML/CSS/JS + GitHub Actions CI/CD

---

## System Architecture

### High-Level Architecture
Tauri v2 app — lightweight native window wrapper with WebView2:
- **Rust backend (Tauri)** — window management, build to .exe
- **WebView2 frontend** — camera access (getUserMedia), UI rendering
- **Context menu** — custom HTML/JS menu on right-click

### Build Pipeline:
```
Dev (WSL2) → git push dev → GitHub Actions (windows-latest) → cargo tauri build --bundles nsis → .exe
                                                             → dev pre-release (updated automatically)
Tag v* → stable GitHub Release with .exe
```

### Runtime Data Flow:
```
enumerateDevices() → camera list → dropdown/menu → getUserMedia({deviceId}) → MediaStream → <video>
```

---

## Current Capabilities

- ✅ Tauri v2 with WebView2
- ✅ Deferred camera discovery (user-initiated, no auto-detect on startup)
- ✅ Discover button (↻) with spin animation + dropdown click trigger
- ✅ Context menu (right-click): camera list, fullscreen, resolution info
- ✅ Fullscreen: F11, F key, double-click, Esc to exit, context menu
- ✅ Tauri v2 capabilities (window permissions)
- ✅ GitHub Actions CI/CD with dev pre-release
- ✅ Path filter (only code changes trigger builds)
- ✅ Cargo cache including ~/.cargo/bin (Tauri CLI)
- ✅ Portable .exe (~8 MB)
- ✅ MIT License
- 🔲 Code signing via SignPath.io (pending OSS approval)

---

## Technical Stack

### Frontend (WebView2):
- **Language:** JavaScript (ES6+), HTML5, CSS3
- **Camera API:** WebRTC getUserMedia / enumerateDevices
- **Styling:** Separate `style.css`, dark theme
- **Framework:** None — vanilla JS

### Backend (Rust/Tauri):
- **Framework:** Tauri v2.10
- **Window:** Native Windows title bar (960×540 default, resizable, min 320×240)
- **Capabilities:** `core:window:allow-is-fullscreen`, `core:window:allow-set-fullscreen`
- **Build output:** Portable .exe (~8 MB) + NSIS installer

### CI/CD:
- **Platform:** GitHub Actions
- **Runner:** `windows-latest` (MSVC, WebView2)
- **Trigger:** Push to `dev` (with path filter: `src/**`, `src-tauri/**`, `package.json`, `.github/workflows/**`) or tag `v*`
- **Cache:** `~/.cargo/registry`, `~/.cargo/git`, `~/.cargo/bin`, `src-tauri/target`
- **Dev pre-release:** Updated automatically on every push to `dev` (tag `dev-latest`)
- **Stable release:** Created on `v*` tags via `softprops/action-gh-release`

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
├── PRD.md                     # Requirements (WHAT & WHY)
├── PLAN.md                    # Implementation plan (WHEN)
├── TECH.md                    # Technical docs (HOW)
├── .github/workflows/
│   └── build.yml              # GitHub Actions workflow
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

### Video Constraints
High `ideal` values (4096×2160) request the camera's maximum supported resolution. Without `ideal`, getUserMedia defaults to 640×480. The camera provides the best it can — a 1080p camera gives 1080p, a 720p camera gives 720p:
```javascript
{ video: { deviceId: { exact: deviceId }, width: { ideal: 4096 }, height: { ideal: 2160 } } }
```

### Context Menu (right-click)
Custom HTML/JS menu via `contextmenu` event with `preventDefault()`:
- Camera list with active camera marked (● prefix)
- Fullscreen toggle
- Resolution info (read-only)
- Viewport edge correction for positioning

### Fullscreen
Multiple entry points, all calling the same `toggleFullscreen()`:
- **F11** key — standard fullscreen shortcut
- **F** key — alternative (F11 may be intercepted by WebView2)
- **Double-click** on video element
- **Context menu** → "Fullscreen" option
- **Esc** key — exits fullscreen

Uses Tauri window API (`window.__TAURI__.window.getCurrentWindow().setFullscreen()`) with browser Fullscreen API as fallback. Requires `core:window:allow-set-fullscreen` capability in `capabilities/default.json`.

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
git checkout main && git merge dev && git push origin main

# Release
git tag v1.0.0 && git push origin v1.0.0   # → stable GitHub Release
```

---

## Known Issues

### Resolved:
- ~~`--bundles none` invalid on Windows~~ → using `--bundles nsis`
- ~~Fullscreen not working~~ → added Tauri capabilities + F key + dblclick
- ~~Resolution capped at 1080p~~ → removed constraint, camera provides native res
- ~~Black screen on first camera~~ → removed auto-select, deferred discovery
- ~~Norton blocking camera on startup~~ → deferred getUserMedia to user-initiated action

### Potential:
- **WebView2 Runtime** — required on target machine (pre-installed on Win 10 21H2+ / Win 11)
- **WebView2 User Data** — Tauri may create folder in `%LOCALAPPDATA%` (mitigation planned)
- **First CI build** — ~15 min (subsequent ~5 min with cache)

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
