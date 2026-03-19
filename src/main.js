const video = document.getElementById("video");
const select = document.getElementById("cameraSelect");
const discoverBtn = document.getElementById("discoverBtn");
const settingsBtn = document.getElementById("settingsBtn");
const resolutionEl = document.getElementById("resolution");
const noCameraMsg = document.getElementById("noCameraMsg");
const contextMenu = document.getElementById("contextMenu");
const menuFullscreen = document.getElementById("menuFullscreen");
const menuBorderless = document.getElementById("menuBorderless");
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
    showStatus("Camera access denied: " + err.message);
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

    currentStream = stream;
    currentDeviceId = deviceId;
    video.srcObject = stream;
    noCameraMsg.classList.add("hidden");

    select.value = deviceId;

    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    const resText = settings.width + "x" + settings.height;
    resolutionEl.textContent = resText;
    menuResolution.textContent = resText + " @ " + (settings.frameRate || "?") + " fps";
  } catch (err) {
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
  contextMenu.style.left = e.clientX + "px";
  contextMenu.style.top = e.clientY + "px";

  // Keep menu within viewport
  const rect = contextMenu.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    contextMenu.style.left = e.clientX - rect.width + "px";
  }
  if (rect.bottom > window.innerHeight) {
    contextMenu.style.top = e.clientY - rect.height + "px";
  }

  contextMenu.classList.add("visible");
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
      isFullscreen = await win.isFullscreen();
      await win.setFullscreen(!isFullscreen);
      isFullscreen = !isFullscreen;
    } else {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        isFullscreen = true;
      } else {
        await document.exitFullscreen();
        isFullscreen = false;
      }
    }
    menuFullscreen.textContent = isFullscreen ? "Exit fullscreen" : "Fullscreen";
  } catch (err) {
    console.error("Fullscreen error:", err);
  }
}

menuFullscreen.addEventListener("click", () => {
  toggleFullscreen();
  hideContextMenu();
});

// Double-click on video to toggle fullscreen
video.addEventListener("dblclick", () => {
  toggleFullscreen();
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

// Drag window in borderless mode
video.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  if (contextMenu.classList.contains("visible")) {
    hideContextMenu();
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
