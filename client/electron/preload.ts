import { ipcRenderer, contextBridge } from 'electron'
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
const API_BASE = 'http://localhost:5000';
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...

  askAI: async (prompt: string) => {
    const res = await axios.post(`${API_BASE}/ai/ask`, { prompt });
    return res.data;
  },

  // Image analysis
  analyzeImage: async (filePath: string) => {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(filePath));
    const res = await axios.post(`${API_BASE}/screen`, formData, {
      headers: formData.getHeaders(),
    });
    return res.data;
  },

  // Audio transcription
  transcribeAudio: async (filePath: string) => {
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(filePath));
    const res = await axios.post(`${API_BASE}/speech/transcribe`, formData, {
      headers: formData.getHeaders(),
    });
    return res.data;
  },
})
