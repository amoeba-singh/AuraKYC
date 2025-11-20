// src/context/KYCContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const KYCContext = createContext();

export const KYCProvider = ({ children }) => {
  // -----------------------------
  // 1. GLOBAL USER DATA
  // -----------------------------
  const [userData, setUserData] = useState({
    name: "",
    dob: "",
    status: "UNVERIFIED", // UNVERIFIED | VERIFIED | RISK_DETECTED
    riskScore: 0,
    logs: [],
  });

  // -----------------------------
  // 2. UNIQUE SESSION ID
  // -----------------------------
  const [sessionId, setSessionId] = useState(null);

  // Generate session ID on first load
  useEffect(() => {
    let existing = localStorage.getItem("session_id");

    if (!existing) {
      const newId = "sess_" + Math.random().toString(36).substring(2, 12);
      localStorage.setItem("session_id", newId);
      setSessionId(newId);
    } else {
      setSessionId(existing);
    }

    addLog("Session started");
  }, []);


  // -----------------------------
  // 3. DOCUMENT IMAGE URL
  // -----------------------------
  const [documentImageUrl, setDocumentImageUrl] = useState(null);


  // -----------------------------
  // 4. EVENT LOGGING
  // -----------------------------
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setUserData((prev) => ({
      ...prev,
      logs: [`[${timestamp}] ${message}`, ...prev.logs],
    }));
  };


  // -----------------------------
  // 5. RISK SCORE UPDATE FUNCTION
  // -----------------------------
  const updateRiskScore = (score) => {
    setUserData((prev) => ({
      ...prev,
      riskScore: score,
      status: score > 50 ? "RISK_DETECTED" : "VERIFIED",
    }));

    addLog(`Risk score updated: ${score}`);
  };


  // -----------------------------
  // PROVIDER EXPORT
  // -----------------------------
  return (
    <KYCContext.Provider
      value={{
        // user
        userData,
        setUserData,

        // session
        sessionId,

        // logs
        addLog,

        // document image
        documentImageUrl,
        setDocumentImageUrl,

        // risk
        updateRiskScore,
      }}
    >
      {children}
    </KYCContext.Provider>
  );
};

export const useKYC = () => useContext(KYCContext);
