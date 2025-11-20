require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');

const {
    makeSessionId,
    saveUpload,
    fakeExtractFromDocument,
    fileHashSimilarity,
    computeRiskScore,
    ensureDir
} = require('./utils');

const PORT = process.env.PORT || 8000;
const STORAGE_PATH = process.env.STORAGE_PATH || './uploads';
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://localhost:3000').split(',');

ensureDir(STORAGE_PATH);

const app = express();

app.use(cors({
    origin: FRONTEND_ORIGINS.map(o => o.trim()),
    credentials: true
}));
app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    createParentPath: true
}));

// In-memory stores for prototype
const SESSIONS = {};
const DOCUMENT_MAP = {};   // session_id -> filepath
const SELFIE_MAP = {};
const BASIC_INFO_STORE = {};

// GET health
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: process.env.APP_NAME || 'AuraKYC API Gateway (JS)' });
});

// POST /session/start
app.post('/session/start', (req, res) => {
    const sid = makeSessionId();
    SESSIONS[sid] = { created_at: new Date().toISOString() };
    return res.json({ session_id: sid, status: 'session_created' });
});

// POST /onboarding/submit-basic-info
app.post('/onboarding/submit-basic-info', (req, res) => {
    const { session_id, full_name, dob, address } = req.body;
    if (!session_id || !SESSIONS[session_id]) {
        return res.status(404).json({ error: 'session not found' });
    }
    BASIC_INFO_STORE[session_id] = { full_name, dob, address };
    return res.json({ session_id, status: 'basic_info_saved' });
});

// POST /document/upload
app.post('/document/upload', async (req, res) => {
    const session_id = req.body.session_id || (req.fields && req.fields.session_id);
    if (!session_id || !SESSIONS[session_id]) return res.status(404).json({ error: 'session not found' });

    if (!req.files || !req.files.file) return res.status(400).json({ error: 'file missing' });
    const file = req.files.file;
    const buffer = file.data;
    const filepath = saveUpload(buffer, file.name, STORAGE_PATH);
    DOCUMENT_MAP[session_id] = filepath;

    try {
        // run OCR + LLM pipeline
        const { extracted, confidence, ocr_text, llm_raw } = await require('./utils').extractFromDocumentPipeline(filepath);

        let needs_confirmation = false;
        const basic = BASIC_INFO_STORE[session_id] || {};
        if (basic && basic.full_name && extracted.full_name && !extracted.full_name.toLowerCase().includes((basic.full_name || '').toLowerCase())) {
            needs_confirmation = true;
        }

        const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(filepath)}`;
        return res.json({
            session_id,
            extracted_fields: extracted,
            confidence: parseFloat(confidence.toFixed(2)),
            needs_confirmation,
            ocr_text_preview: (ocr_text || '').slice(0, 400),
            llm_raw: (llm_raw || '').slice(0, 1200),
            uploaded_url: publicUrl
        });


    } catch (err) {
        console.error("Document pipeline error:", err);
        return res.status(500).json({ error: 'document processing failed', details: String(err) });
    }
});

// POST /biometric/selfie
// POST /biometric/selfie
app.post('/biometric/selfie', async (req, res) => {
  const session_id = req.body.session_id;
  if (!session_id || !SESSIONS[session_id])
    return res.status(404).json({ error: "session not found" });

  if (!req.files || !req.files.selfie)
    return res.status(400).json({ error: "selfie missing" });

  const selfieFile = req.files.selfie;
  const selfiePath = saveUpload(selfieFile.data, selfieFile.name, STORAGE_PATH);
  SELFIE_MAP[session_id] = selfiePath;

  const documentPath = DOCUMENT_MAP[session_id];
  if (!documentPath)
    return res.status(400).json({ error: "document not uploaded" });

  const { verifyBiometric } = require("./agents/biometricAgent");
  const result = await verifyBiometric(documentPath, selfiePath);

  if (result.error) return res.status(400).json(result);

  return res.json({
    session_id,
    ...result
  });
});



// GET /risk/evaluate?session_id=...&suspicious=true
app.get('/risk/evaluate', (req, res) => {
    const session_id = req.query.session_id;
    const suspicious = (req.query.suspicious === 'true' || req.query.suspicious === '1');

    if (!session_id || !SESSIONS[session_id]) return res.status(404).json({ error: 'session not found' });

    const docPath = DOCUMENT_MAP[session_id];
    const selfiePath = SELFIE_MAP[session_id];
    let doc_conf = 0.0;
    if (docPath) {
        const out = fakeExtractFromDocument(docPath);
        doc_conf = out.confidence;
    }
    let match_score = 0.0;
    if (docPath && selfiePath) match_score = fileHashSimilarity(docPath, selfiePath);

    const { score, level, explanation } = computeRiskScore(doc_conf, match_score, suspicious);

    SESSIONS[session_id] = {
        ...SESSIONS[session_id],
        doc_confidence: doc_conf,
        match_score,
        risk_score: score,
        risk_level: level
    };

    return res.json({
        session_id,
        risk_score: parseFloat(score.toFixed(3)),
        risk_level: level,
        explanation
    });
});

// POST /events/simulate
app.post('/events/simulate', (req, res) => {
    const { session_id, event_type } = req.body;
    if (!session_id || !SESSIONS[session_id]) return res.status(404).json({ error: 'session not found' });

    const suspicious = (event_type === 'suspicious_transaction');
    // recompute risk
    const docPath = DOCUMENT_MAP[session_id];
    const selfiePath = SELFIE_MAP[session_id];
    let doc_conf = 0.0;
    if (docPath) doc_conf = fakeExtractFromDocument(docPath).confidence;
    let match_score = 0.0;
    if (docPath && selfiePath) match_score = fileHashSimilarity(docPath, selfiePath);

    const { score, level, explanation } = computeRiskScore(doc_conf, match_score, suspicious);
    SESSIONS[session_id] = {
        ...SESSIONS[session_id],
        risk_score: score,
        risk_level: level
    };

    return res.json({ session_id, event: event_type, new_risk: { score: parseFloat(score.toFixed(3)), level, explanation } });
});


app.use('/uploads', express.static(path.resolve(STORAGE_PATH)));


app.listen(PORT, () => {
    console.log(`AuraKYC API Gateway running on http://0.0.0.0:${PORT}`);
});
