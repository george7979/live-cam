# Technical Architecture Document - Live Cam

<!-- ⚠️ CKM SEPARATION WARNING ⚠️ -->
<!-- TECH.md is for IMPLEMENTATION FOCUS (HOW) -->
<!-- For business context → see PRD.md -->
<!-- For timeline and planning → see PLAN.md -->

**Version:** 2.1
**Date:** 2026-03-18
**Technical Lead:** Jerzy Maczewski + Claude Code
**Stack:** Tauri v2 (Rust backend) + HTML/CSS/JS (frontend) + GitHub Actions CI/CD

---

## System Architecture Overview

### High-Level Architecture
Aplikacja Tauri v2 — lekki wrapper natywnego okna Windows z WebView2:
- **Rust backend (Tauri)** — zarządzanie oknem, build do .exe
- **WebView2 frontend** — HTML/JS odpowiedzialny za kamerę (getUserMedia) i UI
- **Context menu** — customowe HTML menu na prawym kliku

### Build Pipeline:
```
Dev (WSL2/Linux) → git push dev → GitHub Actions (windows-latest) → cargo tauri build --bundles nsis → .exe artifact
Tag v* → GitHub Release z .exe
```

### Data Flow (runtime):
```
enumerateDevices() → lista kamer → dropdown/menu → getUserMedia({deviceId}) → MediaStream → <video>
```

---

## Current Capabilities

### Implemented Features:
- ✅ Struktura Tauri v2 z WebView2
- ✅ Frontend: enumeracja kamer, dropdown, video stream, context menu, fullscreen
- ✅ GitHub Actions CI/CD — build Windows .exe na push do `dev`
- ✅ Portable .exe (8 MB) — testowany na Windows z kamerą
- ✅ NSIS installer jako dodatkowy artifact

---

## Technical Stack

### Frontend (WebView2):
- **Language:** JavaScript (ES6+), HTML5, CSS3
- **Camera API:** WebRTC getUserMedia / enumerateDevices
- **Styling:** Osobny `style.css`
- **Framework:** Brak — vanilla JS

### Backend (Rust/Tauri):
- **Framework:** Tauri v2.10
- **Window:** Natywne okno Windows z paskiem tytułu (960x540, resizable)
- **Build output:** Portable .exe (~8 MB) + NSIS installer

### CI/CD:
- **Platform:** GitHub Actions
- **Runner:** `windows-latest` (MSVC toolchain, WebView2 preinstalled)
- **Trigger:** Push to `dev` branch lub tag `v*`
- **Caching:** Cargo registry + target dir (przyspiesza kolejne buildy)
- **Artifacts:** Portable .exe (30 dni retencji) + NSIS installer
- **Releases:** Automatyczne przy tagu `v*` (via `softprops/action-gh-release`)

### Development:
- **Dev environment:** WSL2 (Linux) — `cargo tauri dev` z WebKit2GTK
- **Package Manager:** npm (frontend) + cargo (Tauri)
- **Rust version:** 1.94+

---

## Code Organization

### Directory Structure:
```
live-cam/
├── CLAUDE.md           # Instrukcje dla Claude Code
├── README.md           # Dokumentacja użytkownika
├── PRD.md              # Wymagania (WHAT & WHY)
├── PLAN.md             # Plan realizacji (WHEN)
├── TECH.md             # Dokumentacja techniczna (HOW)
├── .github/
│   └── workflows/
│       └── build.yml   # GitHub Actions — build Windows .exe
├── .gitignore
├── package.json
├── src-tauri/          # Rust backend
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── build.rs
│   ├── tauri.conf.json
│   ├── icons/          # App icons (wygenerowane)
│   ├── gen/            # Auto-generated Tauri schemas
│   └── src/
│       └── main.rs     # Entry point (minimal)
└── src/                # Frontend (webview)
    ├── index.html      # Layout: toolbar + video + context menu
    ├── style.css       # Dark theme styling
    └── main.js         # Camera logic, context menu, fullscreen
```

---

## Key Implementation Details

### Enumeracja kamer
Wymagane jest najpierw wywołanie `getUserMedia({video: true})` aby WebView2 zwróciła etykiety urządzeń. Bez tego `enumerateDevices()` zwraca puste `label`. Tymczasowy stream jest natychmiast zatrzymywany.

### Video constraints
```javascript
{
  video: {
    deviceId: { exact: selectedDeviceId },
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  }
}
```
`ideal` zamiast `exact` — WebView2 wybierze najbliższą dostępną rozdzielczość.

### Menu kontekstowe (prawy klik)
Customowe HTML/JS menu (`contextmenu` event z `preventDefault()`):
- Lista kamer z zaznaczeniem aktywnej (● prefix)
- Pełny ekran / Wyjdź z pełnego ekranu
- Informacja o rozdzielczości (read-only)
- Pozycjonowanie z korekcją na krawędzie ekranu

### Fullscreen
- `F11` → toggle fullscreen (Tauri `window.__TAURI__` API z fallback na Fullscreen API)
- `Esc` → wyjście z fullscreen
- Opcja w menu kontekstowym
- Podwójne kliknięcie na video (fallback)

### Device change listener
`navigator.mediaDevices.addEventListener("devicechange", listCameras)` — automatyczne odświeżenie listy kamer przy podłączeniu/odłączeniu urządzenia.

---

## Zero Footprint Strategy

### Zasada: Aplikacja nie zapisuje NICZEGO na dysku

Nie ma konfiguracji do zapamiętania — każdy start jest "czysty":
- Kamery wykrywane na żywo (mogą się zmienić między uruchomieniami)
- Rozmiar okna = stały default (960x540)
- Brak localStorage, cookies, plików konfiguracyjnych

### Tauri + WebView2 cache
Tauri domyślnie tworzy folder WebView2 User Data w `%LOCALAPPDATA%`. Rozwiązanie:
- Przekierować WebView2 data dir do `%TEMP%/live-cam-{random}/`
- System sam wyczyści przy restarcie/cleanup

### Deinstalacja:
```
Usuń live-cam.exe → gotowe
```

---

## Git Workflow

### Branches:
- **`dev`** — default branch, tu pracujemy, CI/CD trigger
- **`main`** — stable, aktualizowany merge z `dev` na życzenie

### Release flow:
```bash
# 1. Praca na dev
git push origin dev          # → automatyczny build .exe

# 2. Gdy dev jest OK → merge do main
git checkout main
git merge dev
git push origin main

# 3. Release
git tag v1.0.0
git push origin v1.0.0      # → GitHub Release z .exe do pobrania
```

---

## Known Issues

### Resolved:
- ~~`--bundles none` nie działa na Windows~~ → użyto `--bundles nsis`

### Potential:
- **WebView2 Runtime** — wymagany na maszynie docelowej (preinstalowany na Win 10 21H2+ / Win 11)
- **WebView2 User Data** — Tauri może tworzyć folder w `%LOCALAPPDATA%` (do zbadania/mitygacji)
- **Pierwsza kompilacja CI** — ~15 min (kolejne ~5 min dzięki cache)

---

## Build & Deployment

### Lokalny dev (WSL2):
```bash
source ~/.cargo/env
cd /home/jerzy/cursor/live-cam
cargo tauri dev    # Uruchomi z WebKit2GTK (bez kamer na WSL2)
```

### Build Windows .exe (GitHub Actions):
```bash
git push origin dev    # Trigger workflow
# → Actions → Artifacts → live-cam-windows (portable .exe)
# → Actions → Artifacts → live-cam-installer (NSIS .exe)
```

### Pobranie .exe z CLI:
```bash
gh run download --repo george7979/live-cam --name live-cam-windows --dir ./build
```

---

*This document serves as the single source of truth for technical implementation.*
