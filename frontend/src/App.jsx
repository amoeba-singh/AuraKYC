// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { KYCProvider } from './context/KYCContext';

// Import Components
import Navbar from './components/Navbar/Navbar';
import LandingPage from './components/LandingPage/LandingPage';
import Onboarding from './components/Onboarding/Onboarding';
import Liveness from './components/Liveness/Liveness';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  return (
    <KYCProvider>
      <Router>
        {/* Navbar sits here, so it is always visible */}
        <Navbar /> 
        
        <div className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/liveness" element={<Liveness />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </KYCProvider>
  );
}

export default App;