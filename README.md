# Live Cam

Minimalist camera viewer for Windows. One job: display your system camera feed.

## Download

Go to [Latest Release](https://github.com/george7979/live-cam/releases/latest) and pick:

- **`live-cam.exe`** — portable, no installation, just run it
- **`Live Cam ... x64-setup.exe`** — installer (adds Start Menu shortcut, Add/Remove Programs entry)

## Features

- **Camera selection** — dropdown with all detected system cameras
- **Live preview** — real-time video stream from selected camera
- **Resizable window** — proportional scaling, maintains aspect ratio
- **Fullscreen** — F11 key, right-click menu, or double-click
- **Right-click menu** — camera switching, fullscreen toggle, resolution info
- **Manual select** — choose your camera from the dropdown, no auto-start
- **Hot-plug** — detects cameras being plugged in or removed
- **Zero footprint** — no config files, no registry entries, delete .exe = full uninstall

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F11 | Toggle fullscreen |
| F   | Toggle fullscreen (alternative) |
| Esc | Exit fullscreen / close context menu |

## Code Signing

Free code signing provided by [SignPath.io](https://about.signpath.io/), certificate by [SignPath Foundation](https://signpath.org/).

The app is open-source — you can inspect the [full source code](https://github.com/george7979/live-cam) and the [build pipeline](.github/workflows/build.yml) that produces the .exe.

## Requirements

- Windows 10 (21H2+) or Windows 11

## License

MIT
