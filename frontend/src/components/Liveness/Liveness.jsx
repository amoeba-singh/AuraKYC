// src/components/Liveness/Liveness.jsx
import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '../../context/KYCContext';
import './Liveness.css';

const Liveness = () => {
  const { setUserData, addLog } = useKYC();
  const navigate = useNavigate();
  
  // TABS: 'FACE' or 'FINGERPRINT'
  const [activeTab, setActiveTab] = useState('FACE');

  // --- FACE ID STATE ---
  const [faceStatus, setFaceStatus] = useState('Align your face in the oval...');
  const [isFaceScanning, setIsFaceScanning] = useState(false);

  // --- FINGERPRINT STATE ---
  const [fingerStatus, setFingerStatus] = useState('Press and Hold to Scan');
  const [scanProgress, setScanProgress] = useState(0);
  const [isFingerSuccess, setIsFingerSuccess] = useState(false);
  const holdTimerRef = useRef(null); // To track the "holding" interval

  // ===========================
  // 1. FACE ID LOGIC
  // ===========================
  const startFaceScan = () => {
    setIsFaceScanning(true);
    setFaceStatus('🔍 Scanning depth map...');
    
    setTimeout(() => setFaceStatus('👁️ Checking passive liveness...'), 1500);
    setTimeout(() => setFaceStatus('📸 Verifying against ID...'), 3000);
    
    setTimeout(() => {
      setFaceStatus('✅ Verified!');
      setUserData(prev => ({ ...prev, status: 'VERIFIED', riskScore: 98 }));
      addLog('Biometric: Face Liveness Passed (99.9%).');
      // Optional: Auto-navigate or let user choose
    }, 4500);
  };

  // ===========================
  // 2. FINGERPRINT LOGIC
  // ===========================
  const startFingerScan = () => {
    if (isFingerSuccess) return;
    setFingerStatus('Scanning...');
    
    // Increase progress every 50ms
    holdTimerRef.current = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdTimerRef.current);
          completeFingerScan();
          return 100;
        }
        return prev + 2; // Speed of scan
      });
    }, 30);
  };

  const stopFingerScan = () => {
    if (isFingerSuccess) return;
    clearInterval(holdTimerRef.current);
    setScanProgress(0);
    setFingerStatus('Scan Failed. Hold until complete.');
  };

  const completeFingerScan = () => {
    setIsFingerSuccess(true);
    setFingerStatus('✅ Fingerprint Verified');
    setUserData(prev => ({ ...prev, riskScore: 99 })); // Boost trust score
    addLog('Biometric: Fingerprint Matched (Source: Touch Sensor).');
  };

  return (
    <div className="liveness-container">
      <h2 className="bio-title">Biometric Assurance Agent</h2>

      {/* TOGGLE TABS */}
      <div className="bio-tabs">
        <button 
          className={`bio-tab ${activeTab === 'FACE' ? 'active' : ''}`}
          onClick={() => setActiveTab('FACE')}
        >
          Face ID
        </button>
        <button 
          className={`bio-tab ${activeTab === 'FINGERPRINT' ? 'active' : ''}`}
          onClick={() => setActiveTab('FINGERPRINT')}
        >
          Touch ID
        </button>
      </div>

      {/* --- FACE ID SECTION --- */}
      {activeTab === 'FACE' && (
        <div className="bio-section fade-in">
          <div className="webcam-wrapper">
            <Webcam audio={false} className="webcam-feed" />
            <div className={`face-overlay ${isFaceScanning ? 'scanning' : ''}`}></div>
            {/* Scanning Line Animation */}
            {isFaceScanning && <div className="scan-line"></div>}
          </div>
          <h3 className="status-text">{faceStatus}</h3>
          {!isFaceScanning && (
            <button className="action-btn" onClick={startFaceScan}>Start Face Scan</button>
          )}
        </div>
      )}

      {/* --- FINGERPRINT SECTION --- */}
      {activeTab === 'FINGERPRINT' && (
        <div className="bio-section fade-in">
          <div 
            className={`fingerprint-sensor ${isFingerSuccess ? 'success' : ''}`}
            onMouseDown={startFingerScan}
            onMouseUp={stopFingerScan}
            onMouseLeave={stopFingerScan}
            onTouchStart={startFingerScan} // For mobile support
            onTouchEnd={stopFingerScan}
          >
            {/* SVG Fingerprint Icon */}
            <svg viewBox="0 0 100 100" className="fingerprint-svg">
              <path d="M50,10 C35,10 25,25 25,40 C25,55 30,60 35,70 C40,80 40,90 40,90" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.5"/>
              <path d="M60,10 C75,10 85,25 85,40 C85,55 80,60 75,70 C70,80 70,90 70,90" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.5"/>
              <path d="M50,25 C40,25 35,35 35,45 C35,55 40,65 50,65 C60,65 65,55 65,45 C65,35 60,25 50,25" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path d="M50,40 C45,40 45,45 45,50" stroke="currentColor" strokeWidth="4" fill="none"/>
              {/* Simple concentric lines for effect */}
              <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="10,5" />
              <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="10,5" />
            </svg>
            
            {/* The Filling Animation */}
            <div className="scan-fill" style={{ height: `${scanProgress}%` }}></div>
          </div>

          <h3 className="status-text">{fingerStatus}</h3>
          {!isFingerSuccess && <p className="instruction-text">(Click and Hold to Scan)</p>}
          
          {/* Proceed Button appears only after verification */}
          {(isFingerSuccess || faceStatus.includes('Verified')) && (
            <button className="action-btn success" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Liveness;

