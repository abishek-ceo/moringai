'use strict';
const { requireAuth } = require('../../lib/auth');
const { getStats } = require('../../lib/db');
const { setCORS } = require('../../lib/utils');

module.exports = async (req, res) => {
  setCORS(res, 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  try {
    res.json(await getStats());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
