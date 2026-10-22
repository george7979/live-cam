#!/bin/bash
# usage: scripts/verify-linux.sh [binary]  (default: src-tauri/target/release/live-cam)
# Launches the app as the "Live Cam" desktop app (portal app ID), clicks Discover
# through the WebKit remote inspector and checks the outcome.
set -u
BIN=$(realpath "${1:-$(dirname "$0")/../src-tauri/target/release/live-cam}")
H="$(cd "$(dirname "$0")" && pwd)"
PORT=9341
pkill -x live-cam; sleep 1
systemd-run --user --scope -q --unit="app-gnome-Live\\x20Cam-v$RANDOM" \
  -E WEBKIT_INSPECTOR_HTTP_SERVER=127.0.0.1:$PORT "$BIN" >/dev/null 2>&1 &
for _ in $(seq 1 30); do curl -s http://127.0.0.1:$PORT/ | grep -q WebPage && break; sleep 1; done
WS=ws://127.0.0.1:$PORT/$(curl -s http://127.0.0.1:$PORT/ | grep -o 'socket/[0-9]*/[0-9]*/WebPage' | head -1)

OUT=$(cd "$H" && timeout 40 uv run -q --with websockets python -I inspector.py "$WS" \
  'discoverBtn.click(); "clicked"' 'sleep:4' \
  'const r=noCameraMsg.getBoundingClientRect(); JSON.stringify({spinning: discoverBtn.classList.contains("discovering"), cameras: [...select.options].filter(o=>o.value).map(o=>o.textContent), ids: [...select.options].filter(o=>o.value).map(o=>o.value), status: noCameraMsg.innerText.trim(), statusHidden: noCameraMsg.classList.contains("hidden"), statusInView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth})' 2>&1)
pkill -x live-cam
STATE=$(echo "$OUT" | tail -1 | python3 -c 'import json,sys; print(json.loads(sys.stdin.read()))')
echo "$STATE"
python3 - "$STATE" <<'EOF'
import json, sys
s = json.loads(sys.argv[1])
checks = {
    "discovery finished": not s["spinning"],
    "cameras listed": len(s["cameras"]) > 0,
    "each camera listed once": len(set(s["ids"])) == len(s["ids"]),
    "camera names distinguishable": len(set(s["cameras"])) == len(s["cameras"]),
    "status message inside the window": s["statusInView"],
}
for name, ok in checks.items():
    print(("PASS " if ok else "FAIL ") + name)
sys.exit(0 if all(checks.values()) else 1)
EOF
