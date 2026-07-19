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

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  // Show offscreen first to measure dimensions
  contextMenu.style.left = "-9999px";
  contextMenu.classList.add("visible");
  const menuW = contextMenu.offsetWidth;
  const menuH = contextMenu.offsetHeight;

  let x = e.clientX;
  let y = e.clientY;
  if (x + menuW > window.innerWidth) x = e.clientX - menuW;
  if (y + menuH > window.innerHeight) y = e.clientY - menuH;

  contextMenu.style.left = x + "px";
  contextMenu.style.top = y + "px";
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
  const rect = settingsBtn.getBoundingClientRect();
  contextMenu.style.left = rect.right - 200 + "px";
  contextMenu.style.top = rect.bottom + 4 + "px";
  contextMenu.classList.toggle("visible");
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
      await updateWindowShadow();
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
  await updateWindowShadow();
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

// The OS shadow is drawn for the rectangular window, so it would frame
// the transparent corners around a cut-out shape.
async function updateWindowShadow() {
  if (!window.__TAURI__) return;
  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    await win.setShadow(!(isBorderless && currentShape !== "rect"));
  } catch (err) {
    console.error("Shadow error:", err);
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
});

// --- Init ---

discoverBtn.addEventListener("click", listCameras);
