# Claude Code Instructions - Live Cam

## Project Overview
Minimalist Tauri v2 desktop app for viewing system cameras on Windows.
Portable .exe (~8 MB), zero footprint, built via GitHub Actions CI/CD.

## Documentation
- **PRD.md** — business requirements (WHAT & WHY)
- **PLAN.md** — implementation plan (WHEN)
- **TECH.md** — technical architecture (HOW)

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

## Coding Standards
- JavaScript: ES6+, vanilla (no npm dependencies in frontend)
- CSS: separate `style.css`, dark theme
- Rust: minimal `main.rs`, Tauri setup only
- No obvious comments, no unnecessary abstractions

## Key Constraints
- **Zero footprint:** App writes nothing to disk — no config, cache, localStorage
- **Single purpose:** Camera preview only — don't add unnecessary features
- **Portable:** Standalone .exe is the primary deliverable
- **No frameworks:** Frontend is vanilla JS, don't add React/Vue/etc.
- **No resolution override:** Camera provides its native resolution

## Commands
```bash
# Dev (WSL2)
source ~/.cargo/env
cargo tauri dev

# Build (via GitHub Actions — not locally)
git push origin dev

# Download .exe
gh run download --repo george7979/live-cam --name live-cam-windows
```

## Security
- No API keys, tokens, or secrets in repo
- CSP in `tauri.conf.json` — restricted to `self` + `mediastream:`
- `getUserMedia` as the only system permission
- Tauri capabilities in `src-tauri/capabilities/default.json` — only window fullscreen permissions
