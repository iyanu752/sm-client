import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 500,
    frame: false, // no title bar
    transparent: true, // allows glass effect
    alwaysOnTop: true, // floats above all apps
    hasShadow: false,
    resizable: false,
    skipTaskbar: true, // hides from taskbar/dock
    focusable: true, // still receives input
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

 mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Optional: make the window click-through (useful if it’s a passive overlay)
  // mainWindow.setIgnoreMouseEvents(true);

  // Uncomment for debugging:
  // mainWindow.webContents.openDevTools({ mode: 'detach' });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Example IPC handler
ipcMain.handle('ping', () => 'pong');
