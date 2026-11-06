'use strict';
const { readBody, setCORS } = require('../../lib/utils');
const { verifySignature } = require('../../lib/razorpay');

module.exports = async (req, res) => {
  setCORS(req, res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    if (!KEY_SECRET) return res.status(503).json({ error: 'Payment gateway not configured' });

    const { parsed } = await readBody(req);
    if (!parsed.razorpay_order_id || !parsed.razorpay_payment_id || !parsed.razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment data' });
    }

    if (!verifySignature(parsed, KEY_SECRET)) {
      return res.status(400).json({ success: false, error: 'Payment signature mismatch — possible tampering' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
