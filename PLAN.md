# Implementation Plan - Live Cam

<!-- ⚠️ CKM SEPARATION WARNING ⚠️ -->
<!-- PLAN.md is for TIMELINE FOCUS (WHEN) -->
<!-- For business requirements → see PRD.md -->
<!-- For technical implementation → see TECH.md -->

**Version:** 2.0
**Date:** 2026-03-18
**Project Manager:** Jerzy Maczewski
**Methodology:** Iterative, CI/CD-driven

---

## Project Timeline

- **Start Date:** 2026-03-18
- **Target Completion MVP:** 2026-03-18
- **Team Size:** 1 osoba + Claude Code

---

## Phase Overview

### Phase 1: Scaffold + kamera ✅
**Goal:** Działająca aplikacja Tauri na WSL2
**Status:** Gotowe — kompiluje i uruchamia się

### Phase 2: GitHub repo + CI/CD
**Goal:** Automatyczny build Windows .exe przez GitHub Actions
**Deliverables:** Workflow budujący .exe, artifact do pobrania

### Phase 3: Test + polish
**Goal:** Test .exe z prawdziwą kamerą na Windows, poprawki
**Deliverables:** Działający live-cam.exe

---

## Task Breakdown

### Phase 1 — Scaffold + kamera ✅
- [x] Inicjalizacja projektu Tauri v2
- [x] Konfiguracja okna (rozmiar, resizable, tytuł)
- [x] Frontend: enumeracja kamer, dropdown, video stream
- [x] Frontend: menu kontekstowe (prawy klik)
- [x] Frontend: fullscreen (F11 + Esc)
- [x] Kompilacja i uruchomienie na WSL2

### Phase 2 — GitHub repo + CI/CD
- [ ] Utworzenie repo na GitHub (private)
- [ ] `.github/workflows/build.yml` — workflow budujący Windows .exe
- [ ] `.gitignore` dla Tauri/Rust/Node
- [ ] Pierwszy push + weryfikacja workflow
- [ ] Pobranie .exe z artifacts

### Phase 3 — Test + polish
- [ ] Test .exe na Windows z prawdziwą kamerą
- [ ] Poprawki UI/UX na podstawie testu
- [ ] Weryfikacja zero footprint (brak plików po zamknięciu)
- [ ] Obsługa błędów (brak kamery, odmowa dostępu)

---

## Dependencies

### External Dependencies:
- **GitHub Actions** — `windows-latest` runner — **Impact:** Critical
- **WebView2 Runtime** — na maszynie docelowej — **Impact:** Critical

---

## Progress Tracking

### Current Status: Phase 2 — GitHub + CI/CD
**Progress:** Phase 1 gotowe, przechodzę do CI/CD pipeline

---

*This plan is a living document. Update regularly based on progress.*
