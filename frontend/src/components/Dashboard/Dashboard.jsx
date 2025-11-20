import React from 'react';
import { useKYC } from '../../context/KYCContext';
import './Dashboard.css';

const Dashboard = () => {
  const { userData, setUserData, addLog } = useKYC();

  const simulateRisk = () => {
    // This button mocks the backend webhook receiving a risk signal
    setUserData(prev => ({ 
      ...prev, 
      status: 'RISK_DETECTED', 
      riskScore: 45 
    }));
    addLog('ALERT: High-risk transaction detected via Graph Neural Network.');
    addLog('Explainability Agent: "Sanctioned entity link found in transaction chain."');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Institution Dashboard</h1>
        </div>
      </div>
      
      <div className="dashboard-content">
        {/* USER CARD */}
        <div className="user-card">
          <div className="user-card-header">
            <div className="user-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2>{userData.name || 'Guest User'}</h2>
              <p className="user-dob">DOB: {userData.dob || 'N/A'}</p>
            </div>
          </div>
          <hr />
          <div className="user-stats">
            <div className="stat-item">
              <div className="stat-label">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Status</span>
              </div>
              <span className={`status-badge ${userData.status === 'VERIFIED' ? 'verified' : userData.status === 'RISK_DETECTED' ? 'risk' : 'unverified'}`}>
                {userData.status}
              </span>
            </div>
            <div className="stat-item">
              <div className="stat-label">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Trust Score</span>
              </div>
              <span className="trust-score">
                {userData.riskScore}%
              </span>
            </div>
          </div>
        </div>

        {/* EVENT LOG */}
        <div className="event-log">
          <div className="event-log-header">
            <div className="log-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>System Logs (pKYC Architecture)</h3>
          </div>
          <div className="log-entries">
            {userData.logs.length === 0 ? (
              <div className="log-empty">No logs yet. Complete onboarding to see activity.</div>
            ) : (
              userData.logs.map((log, i) => (
                <div key={i} className="log-entry">
                  <div className="log-bullet"></div>
                  <span>{log}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* THE DEMO CONTROL */}
      <div className="demo-controls">
        <div className="demo-header">
          <div className="demo-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Demo Controls</h3>
        </div>
        <p>Simulate the "Perpetual KYC" (pKYC) engine detecting a threat.</p>
        <button className="simulate-btn" onClick={simulateRisk}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V2M12 2L8 6M12 2L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 22H16C17.1046 22 18 21.1046 18 20V14C18 12.8954 17.1046 12 16 12H8C6.89543 12 6 12.8954 6 14V20C6 21.1046 6.89543 22 8 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Simulate High-Risk Event</span>
        </button>
      </div>
      
      {/* EXPLAINABILITY POPUP */}
      {userData.status === 'RISK_DETECTED' && (
        <div className="explainability-panel">
          <div className="explainability-header">
            <div className="explainability-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h4>Explainability & Compliance Agent</h4>
          </div>
          <p><strong>Summary:</strong> The user's trust score plummeted because a transaction was initiated with a wallet address historically linked to money laundering (Layer 2 hop detected).</p>
          <button className="download-btn" onClick={() => alert("Report Generated!")}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Download Regulator Report</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

