# Claude Code Instructions - Live Cam

## Project Overview
Minimalist Tauri v2 desktop app for viewing system cameras on Windows and Linux.
Portable .exe (~8 MB) + NSIS installer + Linux .deb, zero footprint, built via GitHub Actions CI/CD.

## Documentation
Project follows the [Context Keeper Method (CKM)](https://github.com/george7979/context-keeper-method) — a documentation framework for AI-assisted work:
- **docs/PRD.md** — business requirements (WHAT & WHY)
- **docs/PLAN.md** — implementation plan (WHEN)
- **docs/TECH.md** — technical architecture (HOW)

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS (no framework) — `src/`
- **Backend:** Rust/Tauri v2 (minimal, window management only) — `src-tauri/`
- **CI/CD:** GitHub Actions — `.github/workflows/build.yml`
- **Repo:** `george7979/live-cam` (public)

## Git Workflow
- **`dev`** — default branch, CI/CD trigger, active development
- **`main`** — stable, merge from dev on demand
- Push to `dev` → automatic Windows .exe build + dev pre-release update
- Tag `v*` → stable GitHub Release with .exe
- CI only triggers on code changes (path filter: `src/`, `src-tauri/`, `package.json`, `.github/workflows/`)
- **Commit identity:** GitHub rejects pushes whose commits carry a private e-mail — set it per clone:
  `git config user.name jerzy && git config user.email 76055443+george7979@users.noreply.github.com`

## Coding Standards
- JavaScript: ES6+, vanilla (no npm dependencies in frontend)
- CSS: separate `style.css`, dark theme
- Rust: minimal `main.rs`, Tauri setup only (plus Linux workarounds — see TECH)
- No obvious comments, no unnecessary abstractions

## Key Constraints
- **Zero footprint:** App writes nothing to disk — no config, cache, localStorage
- **Single purpose:** Camera preview only — don't add unnecessary features
- **Portable:** Standalone .exe is the primary deliverable
- **No frameworks:** Frontend is vanilla JS, don't add React/Vue/etc.
- **No resolution override:** Camera provides its native resolution
- **No auto-discovery:** Camera detection is user-initiated (Discover button / dropdown click) — never call getUserMedia on startup
- **English UI:** All user-facing text in English

## Commands
```bash
# Dev (WSL2)
source ~/.cargo/env
cargo tauri dev

# Windows build (via GitHub Actions — not locally)
git push origin dev

# Download .exe
gh run download --repo george7979/live-cam --name live-cam-windows

# Local Linux .deb (native Linux; system deps as in build.yml, `libayatana-appindicator3-dev` on Ubuntu 24.04+)
cargo tauri build --bundles deb

# Linux check on real cameras: Discover → cameras listed + status message on screen
scripts/verify-linux.sh
```

## Linux Testing
- **The release webview has no devtools** — inspect it anyway with
  `WEBKIT_INSPECTOR_HTTP_SERVER=127.0.0.1:<port>`; `scripts/inspector.py` evaluates JS through it
- **Launch as the desktop app** (`systemd-run --user --scope --unit="app-gnome-Live\x20Cam-…"`,
  as `verify-linux.sh` does): started from a terminal, the camera portal sees no app ID and GNOME
  Shell refuses its dialog
- **Remote desktop session:** logind grants `/dev/video*` only to the session on the physical
  seat — over GNOME Remote Desktop the app sees no cameras until access is granted
  (`sudo setfacl -m u:$USER:rw /dev/video* /dev/media*`, then `systemctl --user restart wireplumber`)
- **GTK internals of the release build:** load a GTK3 module via `GTK_MODULES=/abs/path/lib.so`
  (e.g. emission hooks on `button-press-event` / `clicked` — call `g_type_class_ref` first)
- **Synthetic input on GNOME Wayland:** Mutter's `org.gnome.Mutter.RemoteDesktop` D-Bus API
  (+ `ScreenCast.RecordMonitor` for absolute pointer motion); `WAYLAND_DEBUG=client` shows what the
  app sends (`set_minimized`, `move`, …). Over remote desktop the pointer moves in 0.8 px steps
- **Linux-only code** in `main.rs` stays behind `cfg(target_os = "linux")` — Windows build must not change

## Security
- No API keys, tokens, or secrets in repo
- CSP in `tauri.conf.json` — restricted to `self` + `mediastream:`
- `getUserMedia` as the only system permission (deferred to user action)
- Tauri capabilities in `src-tauri/capabilities/default.json` — only window fullscreen permissions
- **Code signing:** SignPath.io OSS program (pending setup) — see `SIGNPATH-SETUP.md` (gitignored)
- **License:** MIT
