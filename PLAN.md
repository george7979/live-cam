# Implementation Plan - Live Cam

<!-- ⚠️ CKM SEPARATION WARNING ⚠️ -->
<!-- PLAN.md is for TIMELINE FOCUS (WHEN) -->
<!-- For business requirements → see PRD.md -->
<!-- For technical implementation → see TECH.md -->

**Version:** 2.1
**Date:** 2026-03-18
**Project Manager:** Jerzy Maczewski
**Methodology:** Iterative, CI/CD-driven

---

## Project Timeline

- **Start Date:** 2026-03-18
- **MVP Completion:** 2026-03-18
- **Team Size:** 1 osoba + Claude Code

---

## Phase Overview

### Phase 1: Scaffold + kamera ✅
**Goal:** Działająca aplikacja Tauri na WSL2
**Status:** Gotowe

### Phase 2: GitHub repo + CI/CD ✅
**Goal:** Automatyczny build Windows .exe przez GitHub Actions
**Status:** Gotowe — repo publiczne, workflow działa, .exe buduje się poprawnie

### Phase 3: Test na Windows ✅
**Goal:** Test .exe z prawdziwą kamerą na Windows
**Status:** Gotowe — aplikacja działa

### Phase 4: Dokumentacja + merge do main
**Goal:** Aktualizacja CKM, CLAUDE.md, README.md, merge dev → main, pierwszy release
**Status:** W toku

---

## Task Breakdown

### Phase 1 — Scaffold + kamera ✅
- [x] Inicjalizacja projektu Tauri v2
- [x] Konfiguracja okna (rozmiar, resizable, tytuł)
- [x] Frontend: enumeracja kamer, dropdown, video stream
- [x] Frontend: menu kontekstowe (prawy klik)
- [x] Frontend: fullscreen (F11 + Esc)
- [x] Kompilacja i uruchomienie na WSL2

### Phase 2 — GitHub repo + CI/CD ✅
- [x] Utworzenie repo na GitHub (`george7979/live-cam`, publiczne)
- [x] `.github/workflows/build.yml` — workflow budujący Windows .exe (NSIS)
- [x] `.gitignore` dla Tauri/Rust/Node
- [x] Branching: `dev` (default, CI trigger) + `main` (stable)
- [x] Pierwszy push + weryfikacja workflow — build PASSED
- [x] Pobranie .exe z artifacts (8 MB)

### Phase 3 — Test na Windows ✅
- [x] Test .exe na Windows z prawdziwą kamerą — działa

### Phase 4 — Dokumentacja + release
- [ ] Aktualizacja PRD.md (statusy, metryki)
- [ ] Aktualizacja PLAN.md (statusy faz)
- [ ] Aktualizacja TECH.md (aktualne informacje)
- [ ] Utworzenie CLAUDE.md (instrukcje dla AI)
- [ ] Utworzenie README.md (dokumentacja użytkownika)
- [ ] Merge dev → main
- [ ] Tag v1.0.0 → GitHub Release z .exe

---

## Progress Tracking

### Current Status: Phase 4 — Dokumentacja + release
**Progress:** MVP działa, dokumentacja w aktualizacji

---

*This plan is a living document. Update regularly based on progress.*
