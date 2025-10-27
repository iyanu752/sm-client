"use strict";
const electron = require("electron");
console.log("🚀 Preload script loading...");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  captureScreen: () => {
    console.log("📸 captureScreen invoked from renderer");
    return electron.ipcRenderer.invoke("capture-screen");
  },
  askAI: (prompt) => {
    console.log("🧠 askAI invoked:", prompt);
    return electron.ipcRenderer.invoke("ask-ai", prompt);
  },
  analyzeImage: (filePath) => {
    console.log("🖼️ analyzeImage invoked:", filePath);
    return electron.ipcRenderer.invoke("analyze-image", filePath);
  },
  transcribeAudio: (filePath) => {
    console.log("🎙️ transcribeAudio invoked:", filePath);
    return electron.ipcRenderer.invoke("transcribe-audio", filePath);
  }
});
console.log("✅ Preload script loaded successfully - electronAPI is available on window");
