# Technical Architecture Document - Live Cam

<!-- ⚠️ CKM SEPARATION WARNING ⚠️ -->
<!-- TECH.md is for IMPLEMENTATION FOCUS (HOW) -->
<!-- For business context → see PRD.md -->
<!-- For timeline and planning → see PLAN.md -->

**Version:** 2.0
**Date:** 2026-03-18
**Technical Lead:** Jerzy Maczewski + Claude Code
**Stack:** Tauri v2 (Rust backend) + HTML/CSS/JS (frontend) + GitHub Actions CI/CD

---

## System Architecture Overview

### High-Level Architecture
Aplikacja Tauri v2 — lekki wrapper natywnego okna Windows z webview:
- **Rust backend (Tauri)** — zarządzanie oknem, natywne menu, build do .exe
- **WebView2 frontend** — HTML/JS odpowiedzialny za kamerę (getUserMedia) i UI
- **Context menu** — customowe HTML menu na prawym kliku

### Build Pipeline:
```
Dev (WSL2/Linux) → git push → GitHub Actions (windows-latest) → cargo tauri build → .exe artifact
```

### Data Flow (runtime):
```
enumerateDevices() → lista kamer → dropdown/menu → getUserMedia({deviceId}) → MediaStream → <video>
```

---

## Current Capabilities

### Implemented Features:
- ✅ Struktura Tauri v2 (scaffold)
- ✅ Frontend: enumeracja kamer, dropdown, video stream, context menu, fullscreen
- ✅ Kompilacja i uruchomienie na WSL2 (brak kamer — oczekiwane)
- ⏳ GitHub Actions workflow — do dodania
- ⏳ Test z kamerą na Windows .exe — czeka na CI/CD build

---

## Technical Stack

### Frontend (WebView2):
- **Language:** JavaScript (ES6+), HTML5, CSS3
- **Camera API:** WebRTC getUserMedia / enumerateDevices
- **Styling:** Inline CSS (single-page approach)
- **Framework:** Brak — vanilla JS

### Backend (Rust/Tauri):
- **Framework:** Tauri v2
- **Window:** Natywne okno Windows z paskiem tytułu
- **Build:** Portable .exe (no installer)

### CI/CD:
- **Platform:** GitHub Actions
- **Runner:** `windows-latest` (MSVC toolchain, WebView2 preinstalled)
- **Trigger:** Push to main / tag release
- **Output:** .exe artifact do pobrania z GitHub Releases lub Actions artifacts

### Development:
- **Dev environment:** WSL2 (Linux) — `cargo tauri dev` z WebKit2GTK
- **Package Manager:** npm (frontend) + cargo (Tauri)

---

## Code Organization

### Directory Structure:
```
live-cam/
├── PRD.md              # Wymagania (WHAT & WHY)
├── PLAN.md             # Plan realizacji (WHEN)
├── TECH.md             # Dokumentacja techniczna (HOW)
├── .github/
│   └── workflows/
│       └── build.yml   # GitHub Actions — build Windows .exe
├── src-tauri/          # Rust backend
│   ├── Cargo.toml
│   ├── build.rs
│   ├── tauri.conf.json
│   ├── icons/          # App icons
│   └── src/
│       └── main.rs
├── src/                # Frontend (webview)
│   ├── index.html
│   ├── style.css
│   └── main.js
└── package.json
```

---

## Key Implementation Details

### Enumeracja kamer
Wymagane jest najpierw wywołanie `getUserMedia({video: true})` aby przeglądarka/webview zwróciła etykiety urządzeń. Bez tego `enumerateDevices()` zwraca puste `label`.

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

### Menu kontekstowe (prawy klik)
Customowe HTML/JS menu na prawym kliku w obszarze wideo:
- Pełny ekran / Wyjdź z pełnego ekranu
- Lista kamer (z zaznaczeniem aktywnej)
- Informacja o rozdzielczości

### Fullscreen
- `F11` → toggle fullscreen (Tauri window API lub Fullscreen API)
- `Esc` → wyjście z fullscreen
- Opcja w menu kontekstowym

### Tauri window config
```json
{
  "windows": [{
    "title": "Live Cam",
    "width": 960,
    "height": 540,
    "resizable": true,
    "fullscreen": false,
    "minWidth": 320,
    "minHeight": 240
  }]
}
```

---

## Zero Footprint Strategy

### Zasada: Aplikacja nie zapisuje NICZEGO na dysku

Nie ma konfiguracji do zapamiętania — każdy start jest "czysty":
- Kamery wykrywane na żywo
- Rozmiar okna = stały default (960x540)
- Brak localStorage, cookies, plików konfiguracyjnych

### Problem: Tauri + WebView2 cache
Tauri domyślnie tworzy folder WebView2 User Data w `%LOCALAPPDATA%`. Rozwiązanie:
- Przekierować WebView2 data dir do `%TEMP%/live-cam-{random}/`
- System sam wyczyści przy restarcie

### Deinstalacja:
```
Usuń live-cam.exe → gotowe
```

---

## GitHub Actions CI/CD Pipeline

### Workflow: `.github/workflows/build.yml`

**Trigger:** Push to `main` branch lub tag `v*`

**Kroki:**
1. Checkout kodu
2. Setup Node.js + npm install
3. Setup Rust toolchain
4. `cargo tauri build --bundles none` (Windows runner ma MSVC + WebView2)
5. Upload .exe jako artifact
6. (opcjonalnie) Tworzy GitHub Release przy tagu `v*`

**Runner:** `windows-latest` — zawiera:
- MSVC toolchain (cl.exe, link.exe)
- WebView2 Runtime
- Node.js (via `actions/setup-node`)
- Rust (via `dtolnay/rust-toolchain`)

---

## Known Issues

### Potential:
- **WebView2 Runtime** — wymagany na maszynie docelowej (preinstalowany na Windows 10 21H2+ i Windows 11)
- **getUserMedia permissions** — WebView2 powinno automatycznie pytać o dostęp do kamery
- **Pierwsza kompilacja** — trwa ~3-5 min na GitHub Actions (cache cargo potem przyspiesza)

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
git push origin main    # Trigger workflow
# → GitHub Actions buduje .exe
# → Pobierz z Actions → Artifacts lub Releases
```

### Ręczny build na Windows (alternatywnie):
```powershell
cd live-cam
cargo tauri build --bundles none
# Output: src-tauri\target\release\live-cam.exe
```

---

*This document serves as the single source of truth for technical implementation.*
