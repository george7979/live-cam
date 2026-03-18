const video = document.getElementById("video");
const select = document.getElementById("cameraSelect");
const resolutionEl = document.getElementById("resolution");
const noCameraMsg = document.getElementById("noCameraMsg");
const contextMenu = document.getElementById("contextMenu");
const menuCameras = document.getElementById("menuCameras");
const menuFullscreen = document.getElementById("menuFullscreen");
const menuResolution = document.getElementById("menuResolution");

let currentStream = null;
let cameras = [];
let currentDeviceId = null;

// --- Camera Management ---

async function listCameras() {
  try {
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
    tempStream.getTracks().forEach((t) => t.stop());

    const devices = await navigator.mediaDevices.enumerateDevices();
    cameras = devices.filter((d) => d.kind === "videoinput");

    updateCameraSelect();
    updateCameraMenu();

    if (cameras.length === 1) {
      selectCamera(cameras[0].deviceId);
    } else if (cameras.length === 0) {
      showStatus("Nie znaleziono kamer");
    }
  } catch (err) {
    showStatus("Brak dostępu do kamery: " + err.message);
  }
}

function updateCameraSelect() {
  select.textContent = "";
  if (cameras.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "-- Brak kamer --";
    select.appendChild(opt);
    return;
  }
  cameras.forEach((cam, i) => {
    const opt = document.createElement("option");
    opt.value = cam.deviceId;
    opt.textContent = cam.label || "Kamera " + (i + 1);
    select.appendChild(opt);
  });
}

function updateCameraMenu() {
  menuCameras.textContent = "";
  const label = document.createElement("div");
  label.className = "menu-section-label";
  label.textContent = "Kamery";
  menuCameras.appendChild(label);

  cameras.forEach((cam, i) => {
    const item = document.createElement("div");
    item.className = "menu-item";
    if (cam.deviceId === currentDeviceId) {
      item.classList.add("active");
    }
    item.textContent = cam.label || "Kamera " + (i + 1);
    item.addEventListener("click", () => {
      selectCamera(cam.deviceId);
      hideContextMenu();
    });
    menuCameras.appendChild(item);
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
        width: { ideal: 1920 },
        height: { ideal: 1080 },
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

    updateCameraMenu();
  } catch (err) {
    showStatus("Błąd kamery: " + err.message);
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

document.addEventListener("click", hideContextMenu);

// --- Fullscreen ---

async function toggleFullscreen() {
  try {
    if (window.__TAURI__) {
      const { getCurrentWindow } = window.__TAURI__.window;
      const win = getCurrentWindow();
      const isFullscreen = await win.isFullscreen();
      await win.setFullscreen(!isFullscreen);
      menuFullscreen.textContent = isFullscreen ? "Pełny ekran" : "Wyjdź z pełnego ekranu";
    } else {
      // Fallback for browser testing
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        menuFullscreen.textContent = "Wyjdź z pełnego ekranu";
      } else {
        await document.exitFullscreen();
        menuFullscreen.textContent = "Pełny ekran";
      }
    }
  } catch (err) {
    console.error("Fullscreen error:", err);
  }
}

menuFullscreen.addEventListener("click", () => {
  toggleFullscreen();
  hideContextMenu();
});

// --- Keyboard Shortcuts ---

document.addEventListener("keydown", (e) => {
  if (e.key === "F11") {
    e.preventDefault();
    toggleFullscreen();
  }
  if (e.key === "Escape") {
    hideContextMenu();
  }
});

// --- Init ---

listCameras();

// Listen for device changes (camera plugged/unplugged)
navigator.mediaDevices.addEventListener("devicechange", listCameras);
