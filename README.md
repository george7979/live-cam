# Live Cam

Minimalist camera viewer for Windows. One job: display your system camera feed.

## Features

- **Camera selection** — dropdown with all detected system cameras
- **Live preview** — real-time video stream from selected camera
- **Resizable window** — proportional scaling, maintains aspect ratio
- **Fullscreen** — F11 key, right-click menu, or double-click
- **Right-click menu** — camera switching, fullscreen toggle, resolution info
- **Auto-detect** — automatically selects camera if only one is available
- **Hot-plug** — detects cameras being plugged in or removed

## Download

Download `live-cam.exe` from [Releases](https://github.com/george7979/live-cam/releases).

No installation needed — just run the .exe.

## Requirements

- Windows 10 (21H2+) or Windows 11
- WebView2 Runtime (pre-installed on modern Windows)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F11 | Toggle fullscreen |
| Esc | Exit fullscreen / close context menu |

## Tech Stack

- [Tauri v2](https://v2.tauri.app/) — lightweight desktop framework (~8 MB .exe)
- Vanilla HTML/CSS/JS — no frontend frameworks
- WebRTC getUserMedia — camera access
- GitHub Actions — automated Windows build

## Development

### Prerequisites (WSL2)
```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# System dependencies
sudo apt install libwebkit2gtk-4.1-dev build-essential libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Tauri CLI
cargo install tauri-cli --version "^2"
```

### Run locally
```bash
cargo tauri dev
```
Note: Cameras are not available on WSL2. Use Windows .exe for camera testing.

### Build
Push to `dev` branch triggers GitHub Actions build:
```bash
git push origin dev
```
Download the .exe from Actions artifacts or create a release with a version tag.

## License

MIT
