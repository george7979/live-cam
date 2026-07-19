# Product Requirements Document - Live Cam

<!-- ⚠️ CKM SEPARATION WARNING ⚠️ -->
<!-- PRD.md is for BUSINESS FOCUS (WHAT & WHY) -->
<!-- DON'T include: Code snippets, file paths, technical details, timelines -->
<!-- For implementation details → see TECH.md -->
<!-- For timeline planning → see PLAN.md -->

**Version:** 5.0
**Date:** 2026-07-19
**Author:** Jerzy Maczewski
**Purpose:** Lightweight native desktop app (Windows & Linux) for viewing system camera feeds

---

## Executive Summary

Minimalist desktop application for Windows and Linux whose sole purpose is displaying a live feed from a selected system camera (webcam, USB camera, virtual camera). Lightweight — fast startup, small footprint, zero unnecessary features, no admin rights required. Resizable window with fullscreen support and optional circle/square view shapes that turn the borderless window into a floating camera bubble.

---

## Problem Statement

### Current Challenges:
- Existing camera apps (OBS, Camera app, VLC) are too feature-heavy for simple camera preview
- Need for a dedicated tool that does one thing and does it well
- No lightweight "click and watch" software for Windows system cameras

### Business Context:
- Personal utility tool
- Target platforms: Windows and Linux (native desktop application)
- Installable on corporate laptops — no admin rights or elevation required
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
- **FR3.6** Hide toolbar mode — removes title bar and toolbar for clean video-only view; window draggable by grabbing video
- **FR3.7** Always on top — pin window above all other windows

### FR4: Context Menu (right-click on camera area)
- **FR4.1** Right-click on video area opens context menu
- **FR4.2** Menu options: fullscreen toggle, hide toolbar toggle, resolution info
- **FR4.4** Settings button (⚙) in toolbar as alternative entry point to context menu
- **FR4.3** Menu as alternative access to all functions

### FR5: View Shapes
- **FR5.1** Three view shapes selectable from the context menu: Rectangle (default), Circle, Square
- **FR5.2** Circle and Square crop the camera frame to fill the selected shape
- **FR5.3** In hide-toolbar mode only the shape area stays visible — the rest of the window is transparent (floating camera bubble over the desktop)
- **FR5.4** With the toolbar visible the shape is shown on a black background inside the window
- **FR5.5** Selecting a shape snaps the window to a square; the shape stays inscribed on resize
- **FR5.6** Fullscreen always shows the full camera frame regardless of the selected shape
- **FR5.7** Shape resets to Rectangle on restart (zero footprint — no persistence)

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
- **NFR10** Windows 10/11 and Debian/Ubuntu-based Linux (`.deb` package) as target platforms
- **NFR11** Support for standard system cameras via getUserMedia (WebView2 on Windows, WebKitGTK on Linux)

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
- **C1** App must run natively on Windows and Linux (not in a browser)
- **C2** Must use cameras recognized by the operating system

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
- [x] View shapes: rectangle / circle / square with desktop cut-through in hide-toolbar mode
- [x] Linux `.deb` package published in stable releases

### Could Have (future):
- [ ] Screenshot capture from camera
- [ ] Resolution selection from supported list
- [ ] Mirror/flip option
- [ ] Remember selected camera between sessions (would require config file)

---

*This PRD defines the business requirements for Live Cam. Implementation details → TECH.md. Timeline → PLAN.md.*
