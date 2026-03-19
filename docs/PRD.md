# Product Requirements Document - Live Cam

<!-- ⚠️ CKM SEPARATION WARNING ⚠️ -->
<!-- PRD.md is for BUSINESS FOCUS (WHAT & WHY) -->
<!-- DON'T include: Code snippets, file paths, technical details, timelines -->
<!-- For implementation details → see TECH.md -->
<!-- For timeline planning → see PLAN.md -->

**Version:** 4.0
**Date:** 2026-03-19
**Author:** Jerzy Maczewski
**Purpose:** Lightweight native Windows desktop app for viewing system camera feeds

---

## Executive Summary

Minimalist desktop application for Windows whose sole purpose is displaying a live feed from a selected system camera (webcam, USB camera, virtual camera). Lightweight — fast startup, small footprint, zero unnecessary features. Resizable window with fullscreen support.

---

## Problem Statement

### Current Challenges:
- Existing camera apps (OBS, Camera app, VLC) are too feature-heavy for simple camera preview
- Need for a dedicated tool that does one thing and does it well
- No lightweight "click and watch" software for Windows system cameras

### Business Context:
- Personal utility tool
- Target platform: Windows (native desktop application)
- Philosophy: one function, done right

---

## Target Users

### Primary Users:
1. **Jerzy (owner)** — quick preview of cameras connected to Windows, settings verification, monitoring

---

## Business Objectives

### Primary Goals:
1. **Camera selection** — list of available system cameras in a dropdown
2. **Live preview** — real-time video stream display
3. **Flexible window** — resizable application window
4. **Fullscreen** — ability to switch to full screen

---

## Functional Requirements

### FR1: Camera Selection
- **FR1.1** Display list of all cameras recognized by Windows
- **FR1.2** Select camera from dropdown
- **FR1.3** Manual camera discovery — no auto-detection on startup (user-initiated via Discover button or dropdown click)
- **FR1.4** Seamless switching between cameras (no app restart needed)
- **FR1.5** Discover button (↻) in toolbar for manual camera refresh

### FR2: Video Preview
- **FR2.1** Display live video stream from selected camera
- **FR2.2** Image scales proportionally to window size
- **FR2.3** Display current stream resolution info
- **FR2.4** No resolution override — display whatever the camera provides natively

### FR3: Application Window
- **FR3.1** Standard Windows title bar with camera selection dropdown
- **FR3.2** Resizable window
- **FR3.3** Image adapts to window size (maintaining aspect ratio)
- **FR3.4** Fullscreen via keyboard shortcuts (F11, F), double-click, or context menu; exit with Esc
- **FR3.5** Fixed default window size (no persistence between sessions)

### FR4: Context Menu (right-click on camera area)
- **FR4.1** Right-click on video area opens context menu
- **FR4.2** Menu options: fullscreen toggle, camera list, resolution info
- **FR4.3** Menu as alternative access to all functions

---

## Non-functional Requirements

### Usability:
- **NFR1** Portable .exe (~8 MB) — built automatically via GitHub Actions CI/CD, code-signed via SignPath (planned)
- **NFR2** Intuitive interface — max 2 clicks to preview
- **NFR3** Minimalist UI — only what's needed (camera dropdown + video + fullscreen)

### Zero Footprint:
- **NFR4** Application writes NOTHING to disk — no config files, cache, or logs
- **NFR5** No entries in AppData, Windows registry, or temp
- **NFR6** Uninstall = delete the .exe — nothing else remains

### Performance:
- **NFR7** Fast app startup (< 3 seconds to ready)
- **NFR8** Minimal CPU/RAM usage — doesn't burden the system
- **NFR9** Smooth video — no added rendering delay

### Compatibility:
- **NFR10** Windows 10/11 as target platform
- **NFR11** Support for standard system cameras via WebView2 getUserMedia

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Time to preview | < 5 seconds from Discover click | ✅ Verified |
| App size | < 50 MB | ✅ 8 MB |
| CPU usage at 1080p | < 5% | To verify |

---

## Constraints & Assumptions

### Technical Constraints:
- **C1** App must run natively on Windows (not in a browser)
- **C2** Must use cameras recognized by the Windows system

### Assumptions:
- **A1** Camera is connected and recognized by Windows before user clicks Discover
- **A2** Camera drivers are correctly installed
- **A3** Development on WSL2 (Linux), Windows .exe built via GitHub Actions CI/CD
- **A4** GitHub repository as code source and build pipeline

---

## Acceptance Criteria

### Must Have:
- [x] System camera list in dropdown
- [x] Live video stream from selected camera
- [x] Resizable window with proportional image scaling
- [x] Fullscreen mode (F11, F key, double-click, Esc, context menu)
- [x] Context menu with camera list, fullscreen toggle, resolution info
- [x] Zero footprint — portable .exe, no installer required

### Could Have (future):
- [ ] Screenshot capture from camera
- [ ] Resolution selection from supported list
- [ ] Mirror/flip option
- [ ] Always-on-top window
- [ ] Remember selected camera between sessions (would require config file)

---

*This PRD defines the business requirements for Live Cam. Implementation details → TECH.md. Timeline → PLAN.md.*
