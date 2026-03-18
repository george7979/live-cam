# Claude Code Instructions - Live Cam

## Project Overview
Minimalistyczna aplikacja desktopowa Tauri v2 do podglądu kamer systemowych na Windows.
Portable .exe (~8 MB), zero footprint, budowana przez GitHub Actions CI/CD.

## Documentation
- **PRD.md** — wymagania biznesowe (WHAT & WHY)
- **PLAN.md** — plan realizacji (WHEN)
- **TECH.md** — architektura techniczna (HOW)

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS (no framework) — `src/`
- **Backend:** Rust/Tauri v2 (minimal, window management only) — `src-tauri/`
- **CI/CD:** GitHub Actions — `.github/workflows/build.yml`
- **Repo:** `george7979/live-cam` (public)

## Git Workflow
- **`dev`** — default branch, CI/CD trigger, tu pracujemy
- **`main`** — stable, merge z dev na życzenie
- Push do `dev` → automatyczny build Windows .exe
- Tag `v*` → GitHub Release z .exe

## Coding Standards
- JavaScript: ES6+, vanilla (no npm dependencies in frontend)
- CSS: osobny plik `style.css`, dark theme
- Rust: minimal `main.rs`, tylko Tauri setup
- Bez komentarzy oczywistych, bez zbędnych abstrakcji

## Key Constraints
- **Zero footprint:** Aplikacja nie zapisuje niczego na dysku — brak config, cache, localStorage
- **Single purpose:** Tylko podgląd kamery — nie dodawać zbędnych funkcji
- **Portable:** Sam .exe, brak instalatora jako primary deliverable
- **No frameworks:** Frontend to vanilla JS, nie dodawać React/Vue/etc.

## Commands
```bash
# Dev (WSL2)
source ~/.cargo/env
cargo tauri dev

# Build (via GitHub Actions — nie lokalnie)
git push origin dev

# Download .exe
gh run download --repo george7979/live-cam --name live-cam-windows
```

## Security
- Brak API keys, tokenów ani sekretów w repo
- CSP w `tauri.conf.json` — ograniczony do `self` + `mediastream:`
- `getUserMedia` jako jedyne uprawnienie systemowe
