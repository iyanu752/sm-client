// electron/preload.ts
import { contextBridge, ipcRenderer } from "electron";

console.log("🚀 Preload script loading...");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  captureScreen: () => {
    console.log("📸 captureScreen invoked from renderer");
    return ipcRenderer.invoke("capture-screen");
  },
  
  askAI: (prompt: string) => {
    console.log("🧠 askAI invoked:", prompt);
    return ipcRenderer.invoke("ask-ai", prompt);
  },
  
  analyzeImage: (filePath: string) => {
    console.log("🖼️ analyzeImage invoked:", filePath);
    return ipcRenderer.invoke("analyze-image", filePath);
  },
  
  transcribeAudio: (filePath: string) => {
    console.log("🎙️ transcribeAudio invoked:", filePath);
    return ipcRenderer.invoke("transcribe-audio", filePath);
  },
});

console.log("✅ Preload script loaded successfully - electronAPI is available on window");