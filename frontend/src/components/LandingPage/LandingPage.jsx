import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* HERO SECTION */}
      <header className="hero-section">
        <h1 className="hero-title">AuraKYC</h1>
        <p className="hero-subtitle">KYC that thinks beyond verification</p>
        <Link to="/onboarding" className="cta-button"> Start Live Demo</Link>
      </header>

      {/* FEATURES / NAVIGATION CARDS */}
      <section className="features-grid">
        
        {/* Card 1: Smart Onboarding */}
        <div className="feature-card" onClick={() => navigate('/onboarding')}>
          <div className="card-icon-wrapper">
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 9H17M7 13H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3>Conversational Onboarding</h3>
          <p>Experience GenAI-driven data collection with document autofill and smart parsing.</p>
        </div>

        {/* Card 2: Risk Analytics */}
        <div className="feature-card" onClick={() => navigate('/dashboard')}>
          <div className="card-icon-wrapper">
          <svg className="card-icon" viewBox="0 0 24 24" fill="none">
  <path d="M12 2L4 5V11C4 16 7.5 20.7 12 22C16.5 20.7 20 16 20 11V5L12 2Z" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M8 14L11 11L13.5 13.5L16 10" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
          </div>
          <h3>Risk Analytics (pKYC)</h3>
          <p>View the Perpetual Assurance dashboard and simulate high-risk graph anomalies.</p>
        </div>

        {/* Card 3: Biometrics */}
        <div className="feature-card" onClick={() => navigate('/liveness')}>
          <div className="card-icon-wrapper">
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C12 22 20 16 20 10V5L12 2L4 5V10C4 16 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Biometric Assurance</h3>
          <p>Test our passive liveness detection and deepfake defense layer.</p>
        </div>
      </section>

      {/* UPDATES SECTION */}
      <section className="updates-section">
        <div className="section-header">
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2>Latest Updates</h2>
        </div>
        <div className="update-item">
          <div className="update-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="update-content">
            <strong>v2.1 Release:</strong> Added "Hybrid OCR" for document upload with confidence scoring.
          </div>
        </div>
        <div className="update-item">
          <div className="update-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="update-content">
            <strong>New Agent:</strong> Explainability Agent now summarizes risk logs in plain English.
          </div>
        </div>
      </section>

      {/* COMING SOON */}
      <section className="coming-soon">
        <div className="section-header">
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2>Coming Soon</h2>
        </div>
        <div className="coming-soon-item">
          <svg className="coming-soon-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <strong>ZK-Proofs:</strong> Verify age without revealing birthdate.
          </div>
        </div>
        <div className="coming-soon-item">
          <svg className="coming-soon-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <strong>Cross-Border:</strong> Global ID support for 190+ countries.
          </div>
        </div>
      </section>

      {/* FLOATING CHATBOT BUTTON */}
      <div className="floating-chat" onClick={() => navigate('/onboarding')} title="Chat with Aura">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* FOOTER */}
      <footer>
        <p>&copy; 2025 AuraKYC</p>
      </footer>
    </div>
  );
};

export default LandingPage;

