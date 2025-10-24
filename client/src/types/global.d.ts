export {};

declare global {
  interface Window {
    electronAPI: {
      askAI(prompt: string): Promise<{ answer: string }>;
      analyzeImage(filePath: string): Promise<{ extracted: string }>;
      transcribeAudio(filePath: string): Promise<{ question: string; answer: string }>;
    };
  }
}
