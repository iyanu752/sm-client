/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/electron.d.ts
export interface IElectronAPI {
  captureScreen: () => Promise<string>;
  askAI: (prompt: string) => Promise<{ answer: string }>;
  analyzeImage: (filePath: string) => Promise<any>;
  transcribeAudio: (filePath: string) => Promise<{ transcription: string; aiResponse: string }>;
  resizeWindow: (width: number, height: number) => Promise<{ success: boolean; width?: number; height?: number }>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

export {};
