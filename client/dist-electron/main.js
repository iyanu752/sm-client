import { app, BrowserWindow } from "electron";
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
  win = new BrowserWindow({
    width: 500,
    height: 500,
    frame: false,
    // no title bar
    transparent: true,
    // allows glass effect
    alwaysOnTop: true,
    // floats above all apps
    hasShadow: false,
    resizable: true,
    skipTaskbar: true,
    // hides from taskbar/dock
    focusable: true,
    backgroundColor: "#00000000",
    // fully transparent background (important!)
    // macOS-specific glass effect (ignored on Windows/Linux)
    ...process.platform === "darwin" && {
      vibrancy: "under-window",
      // options: 'under-window', 'fullscreen-ui', 'hud', 'popover'
      visualEffectState: "active"
    },
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
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
