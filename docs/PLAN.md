# Implementation Plan - Live Cam

<!-- ⚠️ CKM SEPARATION WARNING ⚠️ -->
<!-- PLAN.md is for TIMELINE FOCUS (WHEN) -->
<!-- DON'T include: Architecture details, code examples, business justifications -->
<!-- For business requirements → see PRD.md -->
<!-- For technical implementation → see TECH.md -->

**Version:** 5.0
**Date:** 2026-07-19
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

### Phase 6: Post-release UX & Security ✅
**Goal:** Fix Norton/AV issues, improve camera discovery UX, switch UI to English

### Phase 7: Bugfix Release v1.0.2 ✅
**Goal:** Fix double-click fullscreen in borderless mode, camera error handling, release with Linux .deb

### Phase 8: v1.1.0 — View Shapes ✅
**Goal:** Circle/square views with desktop cut-through in borderless mode, small-window UI fixes

### Phase 9: Code Signing 🔲
**Goal:** SignPath.io integration for trusted .exe builds

### Phase 10: Keyboard Camera Switching 🚧
**Goal:** Switch cameras without the toolbar — Space/Tab cycle, 1–9 direct

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

### Phase 6 — Post-release UX & Security ✅
- [x] Remove auto-select camera on startup (fix black screen bug)
- [x] Add "Choose camera" placeholder in dropdown
- [x] Switch all UI text from Polish to English
- [x] Deferred camera discovery — no getUserMedia on startup (fixes Norton/AV blocking)
- [x] Add Discover button (↻) with spin animation
- [x] Dropdown click also triggers discovery on first use
- [x] devicechange listener only activates after first manual discovery
- [x] Add MIT LICENSE file
- [x] Update README with SignPath attribution

### Phase 7 — Bugfix Release v1.0.2 ✅ (2026-07-19)
- [x] Fix double-click fullscreen in borderless mode
- [x] Fix fullscreen state desync on rapid toggling
- [x] Separate camera error messages (permission denied vs no cameras found)
- [x] Validate stream before attaching, clear resolution display on failure
- [x] Context menu dimensions measured before positioning
- [x] CI: include Linux .deb build and attach it to stable releases
- [x] Release v1.0.2 (portable .exe + NSIS installer + .deb, handwritten changelog)

### Phase 8 — v1.1.0 View Shapes ✅ (2026-07-19)
- [x] Rectangle / Circle / Square views in context menu
- [x] Desktop cut-through in borderless mode (transparent window)
- [x] Fix window transparency on Windows (undecorated + shadowless window creation)
- [x] Snap window to square when a shape is selected
- [x] Fullscreen override — always shows the full frame
- [x] Toolbar overflow fix for narrow windows
- [x] Context menu clamped to window bounds
- [x] README: view shapes, Linux support, screenshots
- [x] Release v1.1.0

### Phase 9 — Code Signing 🔲
- [ ] Apply for SignPath.io OSS program (owner action — see SIGNPATH-SETUP.md)
- [ ] Configure SignPath project + signing policy
- [ ] Add SIGNPATH_API_TOKEN to GitHub Secrets
- [ ] Update build.yml with SignPath signing step (portable .exe + NSIS installer)
- [ ] Verify signed .exe (Digital Signatures tab in Properties)
- [ ] Merge dev → main, tag next release

### Phase 10 — Keyboard Camera Switching 🚧 (2026-08-17)
- [x] Cycle shortcut: Space / Tab forward, Shift+Tab back
- [x] Direct shortcut: digits 1–9 by position in the camera list
- [x] Yield to toolbar controls while they hold keyboard focus
- [x] Reject auto-repeat and overlapping switches
- [x] Silent no-op before first discovery and for out-of-range digits
- [x] Docs: README shortcut table, PRD FR1.6, TECH implementation notes
- [ ] Verify on Windows build (no cameras available under WSL2)
- [ ] Version bump + release (owner decision)

---

## Progress Tracking

### Current Status: Phase 10 in progress, Phase 9 pending
**Progress:** v1.1.0 shipped with view shapes and Linux .deb in stable releases. Keyboard camera switching implemented on `dev`, awaiting verification on a Windows build — WSL2 exposes no cameras, so the feature cannot be exercised locally. Code signing awaiting SignPath OSS application.

---

*This plan is a living document. Update regularly based on progress.*
