'use strict';
const crypto = require('crypto');

const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

function getSecret() {
  if (process.env.JWT_SECRET && Buffer.byteLength(process.env.JWT_SECRET) >= 32) return process.env.JWT_SECRET;
  if (isProd) throw new Error('JWT_SECRET is not configured');
  return 'moringai-dev-secret-change-in-production';
}

function getAdminPass() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (isProd) throw new Error('ADMIN_PASSWORD is not configured');
  return 'admin123';
}

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
    const supplied = Buffer.from(sig);
    const wanted = Buffer.from(expected);
    if (supplied.length !== wanted.length || !crypto.timingSafeEqual(supplied, wanted)) return null;
    const metadata = JSON.parse(Buffer.from(header, 'base64url').toString());
    if (metadata.alg !== 'HS256' || metadata.typ !== 'JWT') return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

function requireAuth(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload || payload.admin !== true || payload.site !== 'moringai') {
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
