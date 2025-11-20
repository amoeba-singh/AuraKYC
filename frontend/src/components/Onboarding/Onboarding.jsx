// src/components/Onboarding/Onboarding.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '../../context/KYCContext';
import './Onboarding.css';

const Onboarding = () => {
  const { setUserData, addLog } = useKYC();
  const navigate = useNavigate();
  
  // Toggles and State
  const [mode, setMode] = useState('AUTO'); // 'AUTO' or 'MANUAL'
  const [isUploading, setIsUploading] = useState(false);
  const [confidence, setConfidence] = useState(null); // e.g., 98%
  
  // Chat State
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! You can upload your ID for instant autofill, or chat with me to enter details manually.' }
  ]);
  const [input, setInput] = useState('');

  // Form State
  const [form, setForm] = useState({ name: '', dob: '' });

  // --- FUNCTION 1: THE DOCUMENT UPLOAD MOCK ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulate OCR Processing Time
    setTimeout(() => {
      setIsUploading(false);
      setConfidence(98.5); // Mock Confidence Score
      
      const extractedName = "Alex Mercer";
      const extractedDob = "1992-08-15";

      // Autofill the form
      setForm({ name: extractedName, dob: extractedDob });
      setUserData(prev => ({ ...prev, name: extractedName, dob: extractedDob }));
      
      // Add log
      addLog(`Document Processed: ${file.name}`);
      addLog(`OCR Confidence Score: 98.5%`);

      // Bot confirms
      setMessages(prev => [...prev, { sender: 'bot', text: `I've extracted your details from ${file.name} with 98.5% confidence. Please verify.` }]);
    }, 2000);
  };

  // --- FUNCTION 2: MANUAL OVERRIDE ---
  const handleManualChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  // --- CHAT LOGIC (Existing) ---
  const handleSend = () => {
    if(!input) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setInput('');
    // Simple echo for now, assuming user relies on Doc Upload for this demo
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: "I've noted that down. You can proceed to the next step." }]);
    }, 500);
  };

  return (
    <div className="onboarding-container">
      
      {/* LEFT COLUMN: CHAT */}
      <div className="chat-section">
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="chat-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 10H16M8 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2>Aura Assistant</h2>
          </div>
        </div>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.sender}`}>
              <span className={`chat-bubble ${m.sender}`}>
                {m.text}
              </span>
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
          <button className="chat-send-btn" onClick={handleSend}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: FORM & UPLOAD */}
      <div className="form-section">
        
        <div className="form-header">
          <div className="form-header-content">
            <div className="form-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>User Details</h3>
          </div>
          {/* TOGGLE SWITCH */}
          <button 
            className={`mode-toggle ${mode === 'AUTO' ? 'auto' : ''}`}
            onClick={() => setMode(mode === 'AUTO' ? 'MANUAL' : 'AUTO')}
          >
            {mode === 'AUTO' ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Auto-Fill</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Manual</span>
              </>
            )}
          </button>
        </div>

        {/* DOCUMENT UPLOAD AREA */}
        {mode === 'AUTO' && (
          <div className="upload-area">
            <div className="upload-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p>Drag & Drop ID or Click to Upload</p>
            <input type="file" onChange={handleFileUpload} accept="image/*,.pdf" />
            
            {isUploading && (
              <div className="upload-status uploading">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Analyzing document with GenAI...</span>
              </div>
            )}
            
            {confidence && (
              <div className="upload-status success">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Confidence Score: {confidence}%</span>
              </div>
            )}
          </div>
        )}

        {/* THE FORM */}
        <div className="form-fields">
          <div className="form-field">
            <label>Full Name</label>
            <input 
              type="text" 
              value={form.name} 
              onChange={(e) => handleManualChange('name', e.target.value)}
              readOnly={mode === 'AUTO'}
            />
          </div>
          
          <div className="form-field">
            <label>Date of Birth</label>
            <input 
              type="text" 
              value={form.dob} 
              onChange={(e) => handleManualChange('dob', e.target.value)}
              readOnly={mode === 'AUTO'}
            />
          </div>
        </div>

        <button className="proceed-btn" onClick={() => navigate('/liveness')}>
          <span>Confirm & Proceed to Biometrics</span>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

      </div>
    </div>
  );
};

export default Onboarding;

