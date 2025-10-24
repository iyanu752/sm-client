// import { useState } from 'react'

import './App.css'

function App() {

  return (
    <>
     <div className="container">
    <div className="resize-handle"></div>
    
    <div className="header">
      <div className="logo">
        <div className="logo-icon">🎯</div>
        <span>Interview AI</span>
      </div>
      <button className="listening-btn" id="listenBtn" title="Listen to interviewer">
        <svg className="mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </button>
    </div>

    <button className="main-btn" id="mainBtn">What should I say?</button>

    <div className="response-box" id="responseBox"></div>

    <div className="input-section">
      <div className="input-wrapper">
        <input 
          type="text" 
          className="screen-input" 
          id="screenInput" 
          placeholder="Ask about code or screen content..."
        />
      </div>
      <button className="send-btn" id="sendBtn" title="Analyze screen">
        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>

    <div className="status-indicator">
      <div className="status-dot"></div>
      <span>Ready</span>
    </div>
  </div>

    </>
  )
}

export default App
