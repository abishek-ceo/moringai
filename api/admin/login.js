'use strict';
const { signToken, checkPassword } = require('../../lib/auth');
const { readBody, setCORS } = require('../../lib/utils');

module.exports = async (req, res) => {
  setCORS(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { parsed } = await readBody(req);
  if (!checkPassword(parsed.password)) {
    await new Promise(r => setTimeout(r, 600)); // slow brute-force
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const token = signToken({ admin: true, site: 'moringai' });
  res.json({ success: true, token });
};
