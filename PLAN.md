# Implementation Plan - Live Cam

<!-- ⚠️ CKM SEPARATION WARNING ⚠️ -->
<!-- PLAN.md is for TIMELINE FOCUS (WHEN) -->
<!-- DON'T include: Architecture details, code examples, business justifications -->
<!-- For business requirements → see PRD.md -->
<!-- For technical implementation → see TECH.md -->

**Version:** 3.1
**Date:** 2026-03-18
**Project Manager:** Jerzy Maczewski
**Methodology:** Iterative, CI/CD-driven

---

## Project Timeline

- **Start Date:** 2026-03-18
- **MVP Completion:** 2026-03-18
- **Team Size:** 1 person + Claude Code

---

## Phase Overview

### Phase 1: Scaffold + Camera ✅
**Goal:** Working Tauri app on WSL2

### Phase 2: GitHub Repo + CI/CD ✅
**Goal:** Automated Windows .exe build via GitHub Actions

### Phase 3: Windows Testing ✅
**Goal:** Test .exe with real camera on Windows

### Phase 4: Documentation + Polish ✅
**Goal:** CKM docs, CLAUDE.md, README.md, bug fixes

### Phase 5: Release ✅
**Goal:** Merge dev → main, first stable release v1.0.0

---

## Task Breakdown

### Phase 1 — Scaffold + Camera ✅
- [x] Initialize Tauri v2 project
- [x] Configure window (size, resizable, title)
- [x] Frontend: camera enumeration, dropdown, video stream
- [x] Frontend: context menu (right-click)
- [x] Frontend: fullscreen (F11 + Esc)
- [x] Compile and run on WSL2

### Phase 2 — GitHub Repo + CI/CD ✅
- [x] Create GitHub repo (`george7979/live-cam`, public)
- [x] `.github/workflows/build.yml` — Windows .exe build workflow
- [x] Branching: `dev` (default, CI trigger) + `main` (stable)
- [x] First push + workflow verification — build PASSED
- [x] Download .exe from artifacts (8 MB)

### Phase 3 — Windows Testing ✅
- [x] Test .exe on Windows with real camera — works

### Phase 4 — Documentation + Polish ✅
- [x] Create CLAUDE.md (AI assistant instructions)
- [x] Create README.md (end-user documentation)
- [x] Fix fullscreen (add Tauri capabilities, dblclick, F key)
- [x] Fix video resolution (no constraint override)
- [x] CI: path filter (docs don't trigger builds)
- [x] CI: cache ~/.cargo/bin (faster builds)
- [x] CI: dev pre-release on every push to dev
- [x] Update all CKM docs to English, verify SSOT

### Phase 5 — Release ✅
- [x] Final testing of fullscreen fix
- [x] Fix video resolution (ideal 4096x2160 for max camera res)
- [x] Fix video filling entire container (CSS width/height 100%)
- [x] Code cleanup (removed unused serde deps, optimized bundle targets)
- [x] SmartScreen warning info in README
- [x] Merge dev → main
- [x] Tag v1.0.0 → GitHub Release with .exe
- [x] Set main as default branch

---

## Progress Tracking

### Current Status: v1.0.0 released ✅
**Progress:** All phases complete. App published at https://github.com/george7979/live-cam/releases

---

*This plan is a living document. Update regularly based on progress.*
