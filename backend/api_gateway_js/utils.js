const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const md5File = require('md5-file');
const { createWorker } = require('tesseract.js');
const { OpenAIApi, Configuration } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

function makeSessionId() {
  return crypto.randomUUID();
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveUpload(buffer, filename, storagePath) {
  ensureDir(storagePath);
  const ts = new Date().toISOString().replace(/[:.]/g, '');
  const safeName = `${ts}__${filename}`;
  const filepath = path.join(storagePath, safeName);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

/**
 * Run Tesseract OCR on an image file and return raw text.
 * Uses tesseract.js (WASM). Returns { text, confidence }.
 */
async function runOCR(filepath) {
  const worker = createWorker({
    // logger: m => console.log(m) // uncomment to see OCR progress
  });
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  // you can adjust tessedit pagesegmode config for ID cards if desired
  const { data } = await worker.recognize(filepath);
  await worker.terminate();
  const text = data.text || '';
  // tesseract.js doesn't return a single numeric "confidence" here reliably;
  // we derive a simple heuristic confidence from average confidences per block if present.
  let avgConf = 0.6;
  try {
    if (data && data.blocks && data.blocks.length) {
      const confs = data.blocks.map(b => b.confidence || 60);
      avgConf = confs.reduce((a,b)=>a+b,0)/confs.length/100.0;
    }
  } catch (e) {
    avgConf = 0.6;
  }
  return { text, confidence: Math.max(0.3, Math.min(0.98, avgConf)) };
}

/**
 * Call OpenAI (or other LLM) to semantically extract fields.
 * Example prompt: "Extract full_name, dob (DD-MM-YYYY), id_number, expiry_date, address from the text. Return only valid JSON."
 *
 * Returns parsed JSON object and a confidence estimate (0..1)
 */
async function llmExtractFields(rawText) {
  if (!OPENAI_API_KEY) {
    // fallback heuristic if API key missing (best-effort)
    // quick regex attempts:
    const extracted = {};
    const nameMatch = rawText.match(/Name[:\s]+([A-Z][A-Za-z ]{2,50})/i);
    if (nameMatch) extracted.full_name = nameMatch[1].trim();
    const dobMatch = rawText.match(/(DOB|Date of Birth)[:\s]+([\d\/\-\.\s]{6,10})/i);
    if (dobMatch) extracted.dob = dobMatch[2].trim();
    const idMatch = rawText.match(/([A-Z0-9]{8,20})/i);
    if (idMatch) extracted.id_number = idMatch[1].trim();
    return { extracted, confidence: 0.55, rawText };
  }

  const systemPrompt = `You are an assistant that extracts structured identity fields from OCR text of government ID cards (like passport, driving licence, PAN, Aadhaar). Return strict JSON with fields: full_name, dob (DD-MM-YYYY), id_number, expiry_date (if present, DD-MM-YYYY or empty), address (if present), doc_type (passport/pan/aadhaar/driving_license/unknown). If a field is not found, return empty string. After the JSON, return a short "confidence" float between 0 and 1 in a JSON field "confidence". DO NOT output any other text.`;

  const userPrompt = `OCR_TEXT_START\n${rawText}\nOCR_TEXT_END\nExtract identity fields as described.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  let resp;
  try {
    resp = await openai.createChatCompletion({
      model: "gpt-4o-mini", // or use gpt-4o if available; allow user to change
      messages,
      temperature: 0.0,
      max_tokens: 800
    });
  } catch (err) {
    // try older model or throw
    try {
      resp = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-16k",
        messages,
        temperature: 0.0,
        max_tokens: 800
      });
    } catch (err2) {
      console.error("OpenAI error:", err2);
      throw err2;
    }
  }

  const content = resp.data.choices?.[0]?.message?.content || resp.data.choices?.[0]?.text || "";
  // try to parse JSON from response
  let json = {};
  let conf = 0.6;
  try {
    // attempt to extract first JSON block
    const firstJsonMatch = content.match(/\{[\s\S]*\}/);
    if (firstJsonMatch) {
      json = JSON.parse(firstJsonMatch[0]);
      if (json.confidence && typeof json.confidence === 'number') {
        conf = Math.max(0.2, Math.min(0.99, json.confidence));
        delete json.confidence;
      } else {
        conf = 0.8;
      }
    } else {
      // fallback: try eval
      json = JSON.parse(content);
      conf = 0.7;
    }
  } catch (e) {
    // parsing failed — return the whole content in rawText field
    json = { raw: content };
    conf = 0.6;
  }
  return { extracted: json, confidence: conf, rawText: content };
}

/**
 * Combined pipeline: OCR -> LLM extraction
 * Returns { extracted, confidence, ocr_text }
 */
async function extractFromDocumentPipeline(filepath) {
  const { text, confidence: ocrConf } = await runOCR(filepath);
  // call LLM to extract fields
  const { extracted, confidence: llmConf, rawText } = await llmExtractFields(text);
  // combine confidences conservatively
  const combinedConfidence = Math.max(0.25, Math.min(0.99, 0.6 * ocrConf + 0.4 * llmConf));
  return { extracted, confidence: combinedConfidence, ocr_text: text, llm_raw: rawText };
}

/**
 * Cheap file-hash "similarity" proxy retained for fallback.
 * (We will use client-side face embeddings for production.)
 */
function fileHashSimilarity(path1, path2) {
  if (!fs.existsSync(path1) || !fs.existsSync(path2)) return 0.0;
  try {
    const h1 = md5File.sync(path1);
    const h2 = md5File.sync(path2);
    const len = Math.min(h1.length, h2.length);
    let common = 0;
    for (let i=0;i<len;i++) {
      if (h1[i] === h2[i]) common++;
      else break;
    }
    return Math.min(1.0, common / Math.max(h1.length, h2.length));
  } catch (err) {
    return 0.0;
  }
}

/**
 * Simple risk scoring (still JS rule-based prototype).
 */
function computeRiskScore(documentConfidence=0.0, matchScore=0.0, suspicious=false) {
  let score = Math.max(0, 1 - (documentConfidence * 0.6 + matchScore * 0.4));
  if (suspicious) score = Math.min(1, score + 0.4);
  let level = 'LOW';
  if (score < 0.3) level = 'LOW';
  else if (score < 0.7) level = 'MEDIUM';
  else level = 'HIGH';
  const explanation = `Computed from doc_confidence=${documentConfidence.toFixed(2)}, match_score=${matchScore.toFixed(2)}, suspicious_event=${suspicious}`;
  return { score, level, explanation };
}

module.exports = {
  makeSessionId,
  saveUpload,
  extractFromDocumentPipeline,  // <-- new
  fileHashSimilarity,
  computeRiskScore,
  ensureDir
};
