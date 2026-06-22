'use strict';
const { requireAuth } = require('../../lib/auth');
const { createOrder, getOrders } = require('../../lib/db');
const { generateOrderId, readBody, setCORS } = require('../../lib/utils');

module.exports = async (req, res) => {
  setCORS(res, 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/orders — admin only
  if (req.method === 'GET') {
    if (!requireAuth(req, res)) return;
    try {
      const { status, search, limit, offset } = req.query || {};
      const orders = await getOrders({
        status: status || null,
        search: search || null,
        limit: Math.min(parseInt(limit) || 100, 500),
        offset: parseInt(offset) || 0
      });
      return res.json({ orders });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST /api/orders — public (place order)
  if (req.method === 'POST') {
    try {
      const { parsed } = await readBody(req);
      const { customer, items, total, shipping, paymentMethod, payment } = parsed;

      if (!customer?.name || !customer?.phone) {
        return res.status(400).json({ error: 'Name and phone number are required' });
      }
      if (!Array.isArray(items) || !items.length) {
        return res.status(400).json({ error: 'Cart cannot be empty' });
      }

      const order = {
        id: generateOrderId(),
        customer,
        items,
        total: parseInt(total) || 0,
        shipping: parseInt(shipping) || 0,
        payment_method: paymentMethod || 'cod',
        payment: payment || null,
        status: paymentMethod === 'razorpay' ? 'confirmed' : 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const saved = await createOrder(order);

      // Fire-and-forget email
      try { require('../../lib/email').sendOrderConfirmation(saved).catch(() => {}); } catch (_) {}

      return res.status(201).json({ success: true, order: saved });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
