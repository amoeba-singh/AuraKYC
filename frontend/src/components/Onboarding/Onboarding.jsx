// src/components/Onboarding/Onboarding.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '../../context/KYCContext';
import './Onboarding.css';

const Onboarding = () => {
  const { setUserData, addLog, setDocumentImageUrl } = useKYC();   // 🔥 ADDED setDocumentImageUrl
  const navigate = useNavigate();
  
  // Toggles and State
  const [mode, setMode] = useState('AUTO'); // 'AUTO' or 'MANUAL'
  const [isUploading, setIsUploading] = useState(false);
  const [confidence, setConfidence] = useState(null); 
  
  // Chat State
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! You can upload your ID for instant autofill, or chat with me to enter details manually.' }
  ]);
  const [input, setInput] = useState('');

  // Form State
  const [form, setForm] = useState({ name: '', dob: '' });

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

  // ------------------------------------------------------------------
  // 🔥 FUNCTION 1: REAL DOCUMENT UPLOAD → BACKEND OCR + LLM EXTRACTION
  // ------------------------------------------------------------------
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('session_id', localStorage.getItem("session_id"));  // ensure session exists
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/document/upload`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      console.log("OCR+LLM Response:", data);

      if (data.error) {
        alert("Document processing failed: " + data.error);
        setIsUploading(false);
        return;
      }

      // Extracted fields from backend
      const extractedName = data.extracted_fields?.full_name || "";
      const extractedDob  = data.extracted_fields?.dob || "";
      const conf = data.confidence ? (data.confidence * 100).toFixed(1) : "70";

      setConfidence(conf);

      // 🔥 Save image preview URL to KYCContext so Liveness can use it
      if (data.uploaded_url) {
        setDocumentImageUrl(data.uploaded_url);
        addLog(`Document uploaded at ${data.uploaded_url}`);
      }

      // Autofill UI + global user state
      setForm({ name: extractedName, dob: extractedDob });
      setUserData(prev => ({ ...prev, name: extractedName, dob: extractedDob }));

      // Logs for timeline
      addLog(`Document Processed: ${file.name}`);
      addLog(`OCR+LLM Confidence: ${conf}%`);

      // Bot chat message
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: `I've extracted your details with ${conf}% confidence. Please verify!` }
      ]);

    } catch (err) {
      console.error(err);
      alert("Error uploading document.");
    }

    setIsUploading(false);
  };

  // ------------------------------------------------------------------
  // FUNCTION 2: MANUAL OVERRIDE
  // ------------------------------------------------------------------
  const handleManualChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  // ------------------------------------------------------------------
  // CHAT LOGIC
  // ------------------------------------------------------------------
  const handleSend = () => {
    if (!input) return;

    setMessages([...messages, { sender: 'user', text: input }]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: "Got it! You can also upload your ID for faster entry." }
      ]);
    }, 400);
  };

  // ------------------------------------------------------------------
  // UI RENDER
  // ------------------------------------------------------------------
  return (
    <div className="onboarding-container">
      
      {/* ------------------ LEFT COLUMN: CHAT ------------------ */}
      <div className="chat-section">
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="chat-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 ..."/>
              </svg>
            </div>
            <h2>Aura Assistant</h2>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.sender}`}>
              <span className={`chat-bubble ${m.sender}`}>{m.text}</span>
            </div>
          ))}
        </div>

        <div className="chat-input-container">
          <input 
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..." 
          />
          <button className="chat-send-btn" onClick={handleSend}>Send</button>
        </div>
      </div>

      {/* ------------------ RIGHT COLUMN: FORM ------------------ */}
      <div className="form-section">

        <div className="form-header">
          <h3>User Details</h3>

          {/* MODE TOGGLE */}
          <button 
            className={`mode-toggle ${mode === 'AUTO' ? 'auto' : ''}`}
            onClick={() => setMode(mode === 'AUTO' ? 'MANUAL' : 'AUTO')}
          >
            {mode === 'AUTO' ? "Auto-Fill" : "Manual"}
          </button>
        </div>

        {/* DOCUMENT UPLOAD */}
        {mode === 'AUTO' && (
          <div className="upload-area">
            <p>Upload your ID for instant autofill</p>
            <input 
              type="file" 
              onChange={handleFileUpload}
              accept="image/*,.pdf"
            />

            {isUploading && (
              <div className="upload-status uploading">
                <span>Analyzing document with GenAI...</span>
              </div>
            )}

            {confidence && (
              <div className="upload-status success">
                <span>Confidence Score: {confidence}%</span>
              </div>
            )}
          </div>
        )}

        {/* FORM FIELDS */}
        <div className="form-fields">
          <div className="form-field">
            <label>Full Name</label>
            <input 
              type="text" 
              value={form.name}
              onChange={(e) => handleManualChange("name", e.target.value)}
              readOnly={mode === 'AUTO'}
            />
          </div>

          <div className="form-field">
            <label>Date of Birth</label>
            <input 
              type="text" 
              value={form.dob}
              onChange={(e) => handleManualChange("dob", e.target.value)}
              readOnly={mode === 'AUTO'}
            />
          </div>
        </div>

        <button 
          className="proceed-btn"
          onClick={() => navigate('/liveness')}
        >
          Confirm & Proceed to Biometrics →
        </button>

      </div>

    </div>
  );
};

export default Onboarding;
