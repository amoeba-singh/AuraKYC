import React, { createContext, useState, useContext } from 'react';

const KYCContext = createContext();

export const KYCProvider = ({ children }) => {
  // This state acts as your "Database"
  const [userData, setUserData] = useState({
    name: '',
    dob: '',
    status: 'UNVERIFIED', // UNVERIFIED, VERIFIED, RISK_DETECTED
    riskScore: 0,
    logs: [] // To show the "Event Log"
  });

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setUserData(prev => ({ ...prev, logs: [`[${timestamp}] ${message}`, ...prev.logs] }));
  };

  return (
    <KYCContext.Provider value={{ userData, setUserData, addLog }}>
      {children}
    </KYCContext.Provider>
  );
};

export const useKYC = () => useContext(KYCContext);

