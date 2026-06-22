'use strict';

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `MRG-${ts}-${rand}`;
}

// Read raw + parsed request body — works both in Vercel serverless and Express
async function readBody(req) {
  if (req.body !== undefined) {
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

function tryJSON(str) {
  try { return str ? JSON.parse(str) : {}; } catch { return {}; }
}

function setCORS(res, methods = 'GET, POST, OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = { generateOrderId, readBody, setCORS };
