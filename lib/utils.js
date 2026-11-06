'use strict';

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `MRG-${ts}-${rand}`;
}

// Read raw + parsed request body — works both in Vercel serverless and Express
async function readBody(req) {
  if (req.rawBody !== undefined) {
    const raw = Buffer.isBuffer(req.rawBody) ? req.rawBody.toString('utf8') : req.rawBody;
    return { raw, parsed: tryJSON(raw) };
  }
  if (req.body !== undefined) {
    if (Buffer.isBuffer(req.body)) {
      const raw = req.body.toString('utf8');
      return { raw, parsed: tryJSON(raw) };
    }
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    return { raw, parsed: typeof req.body === 'object' ? req.body : tryJSON(raw) };
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return { raw, parsed: tryJSON(raw) };
}

// Read before touching Vercel's lazy req.body getter: signature checks need exact bytes.
async function readRawBody(req) {
  if (req.rawBody !== undefined) return Buffer.isBuffer(req.rawBody) ? req.rawBody.toString('utf8') : req.rawBody;
  if (req[Symbol.asyncIterator] && !req.readableEnded) {
    const chunks = [];
    let length = 0;
    for await (const chunk of req) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      length += buffer.length;
      if (length > 65536) { const error = new Error('Request body too large'); error.status = 413; throw error; }
      chunks.push(buffer);
    }
    return Buffer.concat(chunks).toString('utf8');
  }
  if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) return req.body.toString();
  const error = new Error('Raw request body unavailable'); error.status = 400; throw error;
}

function tryJSON(str) {
  try {
    const value = str ? JSON.parse(str) : {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch {
    const error = new Error('Invalid JSON request body');
    error.status = 400;
    throw error;
  }
}

const ALLOWED_ORIGINS = new Set([
  'https://moringai.in',
  'https://www.moringai.in',
  'http://localhost:3000'
]);

// The site only ever calls these APIs same-origin (relative fetch('/api/...')),
// so there is no legitimate cross-origin caller — restrict CORS instead of
// allowing '*', which would let any other site replay authenticated requests
// made with a stolen/guessed admin Bearer token.
function setCORS(req, res, methods = 'GET, POST, OPTIONS') {
  const origin = req && req.headers && req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = { generateOrderId, readBody, readRawBody, setCORS };
