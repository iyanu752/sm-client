// src/App.tsx
import { useState, useRef } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000";

function App() {
  const [output, setOutput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [inputValue, setInputValue] = useState("");

  // 🔍 Debug: Log what's available on window
  console.log("window.electronAPI:", window.electronAPI);
  console.log("Available keys:", window.electronAPI ? Object.keys(window.electronAPI) : "undefined");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedQuestionRef = useRef<string>("");

  // 🎤 Start or stop recording
  const handleListenClick = async () => {
    if (!isListening) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          setStatus("Transcribing...");

          try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");

            const res = await fetch(`${API_BASE}/speech/transcribe`, {
              method: "POST",
              body: formData,
            });

            if (!res.ok) throw new Error(`Transcription failed: ${res.status}`);
            const result = await res.json();

            recordedQuestionRef.current = result.question;
            setOutput(`Q: ${result.question}\n\nProcessing answer...`);
            setStatus("Getting AI response...");

            const aiRes = await fetch(`${API_BASE}/ai/ask`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ prompt: result.question }),
            });

            if (!aiRes.ok) throw new Error(`AI request failed: ${aiRes.status}`);
            const aiResult = await aiRes.json();

            setOutput(`Q: ${result.question}\n\nA: ${aiResult.answer}`);
            setStatus("Ready");
          } catch (err) {
            console.error(err);
            setOutput(`Error: ${err}`);
            setStatus("Error");
          }
        };

        mediaRecorder.start();
        setIsListening(true);
        setStatus("Listening...");
      } catch (err) {
        console.error("Microphone error:", err);
        setOutput(`Microphone error: ${err}`);
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
      setIsListening(false);
      setStatus("Processing...");
    }
  };

  const handleMainButtonClick = async () => {
    if (!recordedQuestionRef.current) {
      setOutput("Please record a question first by clicking the mic button.");
      return;
    }
    setStatus("Generating answer...");

    try {
      const res = await fetch(`${API_BASE}/ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: recordedQuestionRef.current }),
      });

      if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
      const result = await res.json();

      setOutput(`Q: ${recordedQuestionRef.current}\n\nA: ${result.answer}`);
      setStatus("Ready");
    } catch (err) {
      console.error(err);
      setOutput(`Error: ${err}`);
      setStatus("Error");
    }
  };

  const handleSendClick = async () => {
    if (inputValue.trim()) {
      setStatus("Thinking...");
      try {
        const res = await fetch(`${API_BASE}/ai/ask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: inputValue }),
        });

        if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
        const result = await res.json();

        setOutput(`Q: ${inputValue}\n\nA: ${result.answer}`);
        setInputValue("");
        setStatus("Ready");
      } catch (err) {
        console.error(err);
        setOutput(`Error: ${err}`);
        setStatus("Error");
      }
    } else {
      setStatus("Capturing screen...");
      
      // ✅ Fixed: Check for electronAPI instead of ipcRenderer
      if (!window.electronAPI || typeof window.electronAPI.captureScreen !== 'function') {
        setOutput("Screen capture not available. Are you running in Electron?");
        setStatus("Error");
        return;
      }
      
      try {
        const imageBase64 = await window.electronAPI.captureScreen();
        setStatus("Analyzing screen...");

        const byteString = atob(imageBase64.split(",")[1]);
        const mimeString = imageBase64.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: mimeString });

        const formData = new FormData();
        formData.append("image", blob, "screenshot.png");

        const res = await fetch(`${API_BASE}/screen/analyze`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error(`Screen analysis failed: ${res.status}`);
        const result = await res.json();

        setOutput(
          `Screen Analysis:\n\n${result.aiResponse || result.description || result.analysis || JSON.stringify(result)}`
        );
        setStatus("Ready");
      } catch (err) {
        console.error(err);
        setOutput(`Error: ${err}`);
        setStatus("Error");
      }
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendClick();
  };

  return (
    <div className="container">
      <div className="header">
        <div className="logo">
          <div className="logo-icon">🎯</div>
          <span>Knowly</span>
        </div>
        <button
          className={`listening-btn ${isListening ? "listening" : ""}`}
          onClick={handleListenClick}
          title="Listen to interviewer"
        >
          <svg className="mic-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
      </div>

      <button className="main-btn " onClick={handleMainButtonClick}>
        What should I say?
      </button>

      <div className="response-box">{output}</div>

      <div className="input-section">
        <div className="input-wrapper">
          <input
            type="text"
            className="screen-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleInputKeyPress}
            placeholder="Ask about code or screen content..."
          />
        </div>
        <button onClick={handleSendClick} className="send-btn" title="Send or analyze screen">
          <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <div className="status-indicator">
        <div className={`status-dot ${status === "Listening..." ? "listening" : ""}`}></div>
        <span>{status}</span>
      </div>
    </div>
  );
}

export default App;