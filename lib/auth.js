'use strict';
const crypto = require('crypto');

const getSecret = () => process.env.JWT_SECRET || 'moringai-dev-secret-change-in-production';
const getAdminPass = () => process.env.ADMIN_PASSWORD || 'admin123';

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 28800; // 8 hours
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expected = crypto.createHmac('sha256', getSecret()).update(`${header}.${body}`).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

function requireAuth(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!verifyToken(token)) {
    res.status(401).json({ error: 'Unauthorized — please log in' });
    return false;
  }
  return true;
}

function checkPassword(password) {
  const actual = Buffer.from(getAdminPass());
  const given = Buffer.from(String(password || ''));
  if (actual.length !== given.length) return false;
  return crypto.timingSafeEqual(actual, given);
}

module.exports = { signToken, verifyToken, requireAuth, checkPassword };
