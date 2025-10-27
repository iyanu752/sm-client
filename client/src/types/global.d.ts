/* eslint-disable @typescript-eslint/no-explicit-any */

export {};

declare global {
  interface Window {
    ipcRenderer: {
      on: (...args: Parameters<Electron.IpcRenderer["on"]>) => Electron.IpcRenderer;
      off: (...args: Parameters<Electron.IpcRenderer["off"]>) => Electron.IpcRenderer;
      send: (...args: Parameters<Electron.IpcRenderer["send"]>) => void;
      invoke: (...args: Parameters<Electron.IpcRenderer["invoke"]>) => Promise<any>;

      // ✅ Your custom APIs
      askAI(prompt: string): Promise<{ answer: string }>;
      analyzeImage(filePath: string): Promise<any>;
      transcribeAudio(filePath: string): Promise<any>;
      captureScreen(): Promise<string>;
    };
  }
}
