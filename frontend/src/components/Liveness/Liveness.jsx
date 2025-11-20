// src/components/Liveness/Liveness.jsx
import React, { useEffect, useRef, useState, useContext } from "react";
import * as faceapi from "face-api.js";
import { useKYC } from "../../context/KYCContext";

export default function Liveness() {
  const {
    sessionId,
    documentImageUrl,
    updateRiskScore,
    userData,
    setUserData,
    addLog
  } = useKYC();

  const videoRef = useRef();
  const canvasRef = useRef();

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [matchScore, setMatchScore] = useState(null);
  const [livenessScore, setLivenessScore] = useState(null);

  // -----------------------------
  // 1. LOAD FACE MODELS
  // -----------------------------
  useEffect(() => {
    async function loadModels() {
      const MODEL_URL =
        process.env.REACT_APP_FACE_MODELS ||
        "https://justadudewhohacks.github.io/face-api.js/models";

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);

      setModelsLoaded(true);
      addLog("Liveness models loaded.");
    }
    loadModels();
  }, []);


  // -----------------------------
  // 2. START CAMERA
  // -----------------------------
  useEffect(() => {
    if (!modelsLoaded) return;

    async function startVideo() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (e) {
        alert("Camera access blocked. Please allow camera permissions.");
        console.error(e);
      }
    }

    startVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, [modelsLoaded]);


  // --------------------------------------------
  // 3. CAPTURE SELFIE + BIOMETRIC PROCESSING
  // --------------------------------------------
  async function captureSelfie() {
    if (!videoRef.current) return;
    setProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const selfieBlob = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", 0.92)
    );

    // Detect face on selfie
    const selfieImage = await faceapi.bufferToImage(selfieBlob);
    const selfieDet = await faceapi
      .detectSingleFace(selfieImage)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!selfieDet) {
      alert("No face detected in selfie. Try better lighting.");
      setProcessing(false);
      return;
    }

    // Detect face on uploaded ID document
    if (!documentImageUrl) {
      alert("Document image missing. Upload ID first.");
      setProcessing(false);
      return;
    }

    const docImg = await faceapi.fetchImage(documentImageUrl);
    const docDet = await faceapi
      .detectSingleFace(docImg)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!docDet) {
      alert("No face detected on ID document.");
      setProcessing(false);
      return;
    }

    // Cosine similarity
    function cosine(a, b) {
      const dot = a.reduce((s, ai, i) => s + ai * b[i], 0);
      const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
      const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
      return dot / (na * nb);
    }

    const sim = cosine(selfieDet.descriptor, docDet.descriptor);
    const mapped = Math.max(0, (sim + 1) / 2); // convert to [0-1]

    setMatchScore(mapped.toFixed(3));
    addLog(`Face match score: ${mapped.toFixed(3)}`);

    // ------------------------------------------------
    // 4. SEND TO BACKEND — REAL LIVENESS + PRNU
    // ------------------------------------------------
    const apiUrl = process.env.REACT_APP_API_BASE || "http://localhost:8000";

    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("match_score", mapped);
    formData.append("selfie", selfieBlob, "selfie.jpg");

    try {
      const resp = await fetch(`${apiUrl}/biometric/liveness`, {
        method: "POST",
        body: formData
      });

      const data = await resp.json();

      if (data.liveness_score) {
        setLivenessScore(data.liveness_score);
        addLog(`Liveness score: ${data.liveness_score}`);
      }

      if (data.prnu_verified !== undefined) {
        addLog(`PRNU spoof check: ${data.prnu_verified ? "PASS" : "FAIL"}`);
      }

      // Update verification result into global KYC state
      if (mapped > 0.75 && data.liveness_score > 0.75) {
        setUserData((prev) => ({ ...prev, status: "VERIFIED" }));
        addLog("Biometrics verified successfully.");
      } else {
        setUserData((prev) => ({ ...prev, status: "RISK_DETECTED" }));
        addLog("Biometrics suspicious — flagged for review.");
      }

    } catch (err) {
      console.error(err);
      alert("Failed to submit biometric data.");
    }

    setProcessing(false);
  }


  return (
    <div className="liveness-container">
      <h2>Biometric Liveness Verification</h2>
      {!modelsLoaded && (
        <div>Loading biometric models… please wait.</div>
      )}

      <video
        ref={videoRef}
        width="420"
        height="320"
        style={{ border: "1px solid #ccc", borderRadius: 8 }}
      ></video>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <button
        onClick={captureSelfie}
        disabled={!modelsLoaded || processing}
        style={{ marginTop: 16 }}
      >
        {processing ? "Processing…" : "Capture & Verify"}
      </button>

      {matchScore && (
        <div style={{ marginTop: 12 }}>
          Face Match Score: <b>{matchScore}</b>
        </div>
      )}

      {livenessScore && (
        <div>
          Liveness Score: <b>{livenessScore}</b>
        </div>
      )}

      {userData.status !== "UNVERIFIED" && (
        <div style={{ marginTop: 16, padding: 12 }}>
          Status: <b>{userData.status}</b>
        </div>
      )}
    </div>
  );
}
