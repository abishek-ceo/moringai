'use strict';
const { requireAuth } = require('../../lib/auth');
const { getOrderById, updateOrder } = require('../../lib/db');
const { readBody, setCORS } = require('../../lib/utils');

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

module.exports = async (req, res) => {
  setCORS(res, 'GET, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const order = await getOrderById(id);
      return res.json({ order });
    } catch {
      return res.status(404).json({ error: 'Order not found' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { parsed } = await readBody(req);
      const { status, notes } = parsed;
      if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
      }
      const updates = {};
      if (status !== undefined) updates.status = status;
      if (notes !== undefined) updates.notes = notes;
      const order = await updateOrder(id, updates);
      return res.json({ success: true, order });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
