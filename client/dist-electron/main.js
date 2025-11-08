import { ipcMain, desktopCapturer, app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const require2 = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  const preloadPath = path.join(__dirname, "preload.js");
  console.log("==========================================");
  console.log("🔍 Preload path:", preloadPath);
  console.log("🔍 __dirname:", __dirname);
  console.log("🔍 process.cwd():", process.cwd());
  console.log("🔍 MAIN_DIST:", MAIN_DIST);
  const fs = require2("fs");
  const preloadExists = fs.existsSync(preloadPath);
  console.log("🔍 Preload exists?", preloadExists);
  if (!preloadExists) {
    console.error("❌ PRELOAD FILE NOT FOUND!");
    console.log("📁 Contents of dist-electron:");
    try {
      const files = fs.readdirSync(__dirname);
      files.forEach((file) => console.log("  -", file));
    } catch (e) {
      console.error("Could not read directory:", e);
    }
  }
  console.log("==========================================");
  win = new BrowserWindow({
    width: 500,
    height: 500,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: true,
    skipTaskbar: true,
    focusable: true,
    backgroundColor: "#00000000",
    ...process.platform === "darwin" && {
      vibrancy: "under-window",
      visualEffectState: "active"
    },
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true
    }
  });
  win.setContentProtection(true);
  if (process.platform === "darwin") {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }
  win.on("will-move", (event, bounds) => {
    const { screen } = require2("electron");
    const display = screen.getDisplayNearestPoint({ x: bounds.x, y: bounds.y });
    const { width, height } = display.workArea;
    if (bounds.x + 50 > width || bounds.y + 50 > height || bounds.x < -450 || bounds.y < -450) {
      event.preventDefault();
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
ipcMain.handle("capture-screen", async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1920, height: 1080 }
    });
    if (sources.length === 0) {
      throw new Error("No screen sources found");
    }
    const primarySource = sources[0];
    const thumbnail = primarySource.thumbnail;
    const dataURL = thumbnail.toDataURL();
    return dataURL;
  } catch (error) {
    console.error("Screen capture error:", error);
    throw error;
  }
});
ipcMain.handle("ask-ai", async (_event, prompt) => {
  console.log("AI prompt:", prompt);
  return { answer: "AI response placeholder" };
});
ipcMain.handle("analyze-image", async (_event, filePath) => {
  console.log("Analyzing image:", filePath);
  return { analysis: "Image analysis placeholder" };
});
ipcMain.handle("transcribe-audio", async (_event, filePath) => {
  console.log("Transcribing audio:", filePath);
  return { transcription: "Audio transcription placeholder" };
});
ipcMain.handle("toggle-screen-protection", async (_event, enabled) => {
  if (win) {
    win.setContentProtection(enabled);
    return { success: true, enabled };
  }
  return { success: false };
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
