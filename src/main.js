const video = document.getElementById("video");
const select = document.getElementById("cameraSelect");
const discoverBtn = document.getElementById("discoverBtn");
const settingsBtn = document.getElementById("settingsBtn");
const resolutionEl = document.getElementById("resolution");
const noCameraMsg = document.getElementById("noCameraMsg");
const contextMenu = document.getElementById("contextMenu");
const menuFullscreen = document.getElementById("menuFullscreen");
const menuBorderless = document.getElementById("menuBorderless");
const menuAlwaysOnTop = document.getElementById("menuAlwaysOnTop");
const menuShapeRect = document.getElementById("menuShapeRect");
const menuShapeCircle = document.getElementById("menuShapeCircle");
const menuShapeSquare = document.getElementById("menuShapeSquare");
const menuResolution = document.getElementById("menuResolution");

let currentStream = null;
let cameras = [];
let currentDeviceId = null;
let discovered = false;

// --- Camera Management ---

async function listCameras() {
  discoverBtn.classList.add("discovering");
  try {
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
    tempStream.getTracks().forEach((t) => t.stop());

    const devices = await navigator.mediaDevices.enumerateDevices();
    cameras = devices.filter((d) => d.kind === "videoinput");

    updateCameraSelect();

    if (cameras.length === 0) {
      showStatus("No cameras found");
    }

    if (!discovered) {
      discovered = true;
      navigator.mediaDevices.addEventListener("devicechange", listCameras);
    }
  } catch (err) {
    if (err.name === "NotAllowedError") {
      showStatus("Camera permission denied — allow access in browser/system settings");
    } else if (err.name === "NotFoundError") {
      showStatus("No cameras found on this device");
    } else {
      showStatus("Camera error: " + err.message);
    }
  } finally {
    discoverBtn.classList.remove("discovering");
  }
}

function updateCameraSelect() {
  select.textContent = "";
  if (cameras.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "-- No cameras --";
    select.appendChild(opt);
    return;
  }
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "-- Choose camera --";
  placeholder.disabled = true;
  placeholder.selected = !currentDeviceId;
  select.appendChild(placeholder);

  cameras.forEach((cam, i) => {
    const opt = document.createElement("option");
    opt.value = cam.deviceId;
    opt.textContent = cam.label || "Camera " + (i + 1);
    if (cam.deviceId === currentDeviceId) opt.selected = true;
    select.appendChild(opt);
  });
}


async function selectCamera(deviceId) {
  if (currentStream) {
    currentStream.getTracks().forEach((t) => t.stop());
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 4096 },
        height: { ideal: 2160 },
      },
    });

    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();

    currentStream = stream;
    currentDeviceId = deviceId;
    video.srcObject = stream;
    noCameraMsg.classList.add("hidden");

    select.value = deviceId;

    const resText = settings.width + "x" + settings.height;
    resolutionEl.textContent = resText;
    menuResolution.textContent = resText + " @ " + Math.round(settings.frameRate || 0) + " fps";
  } catch (err) {
    resolutionEl.textContent = "";
    menuResolution.textContent = "";
    showStatus("Camera error: " + err.message);
  }
}

function showStatus(msg) {
  noCameraMsg.classList.remove("hidden");
  noCameraMsg.querySelector("p").textContent = msg;
}

// --- Dropdown change ---

select.addEventListener("change", () => {
  if (select.value) {
    selectCamera(select.value);
  }
});

select.addEventListener("mousedown", () => {
  if (!discovered) listCameras();
});

// --- Context Menu ---

function showContextMenu(x, y) {
  // Show offscreen first to measure dimensions
  contextMenu.style.left = "-9999px";
  contextMenu.classList.add("visible");
  const menuW = contextMenu.offsetWidth;
  const menuH = contextMenu.offsetHeight;

  x = Math.max(0, Math.min(x, window.innerWidth - menuW));
  y = Math.max(0, Math.min(y, window.innerHeight - menuH));

  contextMenu.style.left = x + "px";
  contextMenu.style.top = y + "px";
}

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  showContextMenu(e.clientX, e.clientY);
});

function hideContextMenu() {
  contextMenu.classList.remove("visible");
}

document.addEventListener("click", (e) => {
  if (e.target === settingsBtn) return;
  hideContextMenu();
});

settingsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (contextMenu.classList.contains("visible")) {
    hideContextMenu();
    return;
  }
  const rect = settingsBtn.getBoundingClientRect();
  showContextMenu(rect.right - 200, rect.bottom + 4);
});

// --- Fullscreen ---

let isFullscreen = false;

async function toggleFullscreen() {
  try {
    if (window.__TAURI__) {
      const win = window.__TAURI__.window.getCurrentWindow();
      const current = await win.isFullscreen();
      await win.setFullscreen(!current);
      isFullscreen = !current;
    } else {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        isFullscreen = true;
      } else {
        await document.exitFullscreen();
        isFullscreen = false;
      }
    }
    document.body.classList.toggle("fullscreen", isFullscreen);
    menuFullscreen.textContent = isFullscreen ? "Exit fullscreen" : "Fullscreen";
  } catch (err) {
    console.error("Fullscreen error:", err);
  }
}

menuFullscreen.addEventListener("click", () => {
  toggleFullscreen();
  hideContextMenu();
});

// --- Borderless ---

let isBorderless = false;

async function toggleBorderless() {
  try {
    if (window.__TAURI__) {
      const win = window.__TAURI__.window.getCurrentWindow();
      isBorderless = !isBorderless;
      await win.setDecorations(!isBorderless);
      document.body.classList.toggle("borderless", isBorderless);
      menuBorderless.textContent = isBorderless ? "Show toolbar" : "Hide toolbar";
    }
  } catch (err) {
    console.error("Borderless error:", err);
  }
}

menuBorderless.addEventListener("click", () => {
  toggleBorderless();
  hideContextMenu();
});

// --- View Shape ---

let currentShape = "rect";

async function setShape(shape) {
  currentShape = shape;
  document.body.classList.toggle("shape-circle", shape === "circle");
  document.body.classList.toggle("shape-square", shape === "square");
  menuShapeRect.classList.toggle("active", shape === "rect");
  menuShapeCircle.classList.toggle("active", shape === "circle");
  menuShapeSquare.classList.toggle("active", shape === "square");
  if (shape !== "rect") await squareUpWindow();
}

// Shrink the window to a square so the inscribed shape fills it —
// otherwise wide windows leave large invisible-but-clickable margins.
async function squareUpWindow() {
  if (!window.__TAURI__ || isFullscreen) return;
  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    const size = await win.innerSize();
    const side = Math.min(size.width, size.height);
    if (size.width !== size.height) {
      await win.setSize(new window.__TAURI__.window.PhysicalSize(side, side));
    }
  } catch (err) {
    console.error("Resize error:", err);
  }
}

menuShapeRect.addEventListener("click", () => {
  setShape("rect");
  hideContextMenu();
});

menuShapeCircle.addEventListener("click", () => {
  setShape("circle");
  hideContextMenu();
});

menuShapeSquare.addEventListener("click", () => {
  setShape("square");
  hideContextMenu();
});

// --- Always on Top ---

let isAlwaysOnTop = false;

async function toggleAlwaysOnTop() {
  try {
    if (window.__TAURI__) {
      const win = window.__TAURI__.window.getCurrentWindow();
      isAlwaysOnTop = !isAlwaysOnTop;
      await win.setAlwaysOnTop(isAlwaysOnTop);
      menuAlwaysOnTop.textContent = isAlwaysOnTop ? "Always on top ✓" : "Always on top";
    }
  } catch (err) {
    console.error("Always on top error:", err);
  }
}

menuAlwaysOnTop.addEventListener("click", () => {
  toggleAlwaysOnTop();
  hideContextMenu();
});

// Fullscreen on double-click, drag window in borderless mode.
// Uses e.detail on mousedown instead of dblclick — startDragging() hands the
// mouse to the native drag loop, so dblclick never fires in borderless mode.
video.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  if (contextMenu.classList.contains("visible")) {
    hideContextMenu();
    return;
  }
  if (e.detail === 2) {
    toggleFullscreen();
    return;
  }
  if (!isBorderless) return;
  if (window.__TAURI__) {
    window.__TAURI__.window.getCurrentWindow().startDragging();
  }
});

// --- Camera Switching ---

// selectCamera() is async and only updates currentDeviceId once the new stream
// is live, so overlapping calls would compute the next index from stale state.
let switching = false;

async function switchToIndex(i) {
  if (switching || i < 0 || i >= cameras.length) return;
  const target = cameras[i];
  if (target.deviceId === currentDeviceId) return;
  switching = true;
  try {
    await selectCamera(target.deviceId);
  } finally {
    switching = false;
  }
}

function cycleCamera(step) {
  if (!cameras.length) return;
  const at = cameras.findIndex((c) => c.deviceId === currentDeviceId);
  const len = cameras.length;
  switchToIndex(at === -1 ? 0 : (at + step + len) % len);
}

// --- Keyboard Shortcuts ---

document.addEventListener("keydown", (e) => {
  if (e.key === "F11" || e.key === "f" || e.key === "F") {
    e.preventDefault();
    toggleFullscreen();
  }
  if (e.key === "t" || e.key === "T") {
    e.preventDefault();
    toggleAlwaysOnTop();
  }
  if (e.key === "b" || e.key === "B") {
    e.preventDefault();
    toggleBorderless();
  }
  if (e.key === "Escape") {
    if (isFullscreen) {
      toggleFullscreen();
    }
    hideContextMenu();
  }

  // Camera shortcuts yield to the toolbar: while a control holds focus, Space
  // and Tab keep their native meaning. In borderless mode the toolbar is
  // display:none, so focus always rests on body and these always apply.
  if (e.repeat || document.activeElement !== document.body) return;

  if (e.key === "Tab" || e.key === " ") {
    e.preventDefault();
    cycleCamera(e.shiftKey ? -1 : 1);
  }
  if (/^[1-9]$/.test(e.key)) {
    e.preventDefault();
    switchToIndex(Number(e.key) - 1);
  }
});

// --- Init ---

discoverBtn.addEventListener("click", listCameras);

// The window is created undecorated, shadowless and hidden: a Windows window
// created with decorations or an undecorated shadow never becomes transparent
// (tauri-apps/tauri#8632), which the cut-out shapes rely on. Decorations are
// restored here, then the window is shown.
if (window.__TAURI__) {
  const win = window.__TAURI__.window.getCurrentWindow();
  win.setDecorations(true).finally(() => win.show());
}
