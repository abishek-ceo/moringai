'use strict';
const { generateOrderId, readBody, setCORS } = require('../../lib/utils');

module.exports = async (req, res) => {
  setCORS(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const KEY_ID = process.env.RAZORPAY_KEY_ID;
    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    if (!KEY_ID || !KEY_SECRET) {
      return res.status(503).json({ error: 'Payment gateway not configured. Contact support.' });
    }

    const { parsed } = await readBody(req);
    const { items } = parsed;
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'No items provided' });
    }

    const subtotal = items.reduce((s, i) => s + (i.price * i.qty), 0);
    const shipping = subtotal >= 499 ? 0 : 49;
    const totalPaise = (subtotal + shipping) * 100;

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: totalPaise, currency: 'INR', receipt: generateOrderId() })
    });

    const rzpData = await rzpRes.json();
    if (!rzpRes.ok) {
      return res.status(502).json({ error: rzpData.error?.description || 'Payment gateway error' });
    }

    res.json({ success: true, order: rzpData, key: KEY_ID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
