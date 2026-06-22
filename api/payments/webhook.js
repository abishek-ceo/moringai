'use strict';
const crypto = require('crypto');
const { readBody } = require('../../lib/utils');
const { getOrders, updateOrder } = require('../../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Read raw body for signature verification
    const { raw, parsed } = await readBody(req);

    const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (WEBHOOK_SECRET) {
      const signature = req.headers['x-razorpay-signature'];
      const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex');
      if (signature !== expected) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = parsed?.event;
    const payment = parsed?.payload?.payment?.entity;

    if (event === 'payment.captured' && payment?.order_id) {
      // Find matching order by Razorpay order ID stored in payment field
      const orders = await getOrders({ limit: 200 }).catch(() => []);
      const match = orders.find(o => o.payment?.razorpay_order_id === payment.order_id);
      if (match && match.status !== 'confirmed') {
        await updateOrder(match.id, { status: 'confirmed' }).catch(() => {});
      }
    }

    if (event === 'payment.failed' && payment?.order_id) {
      const orders = await getOrders({ limit: 200 }).catch(() => []);
      const match = orders.find(o => o.payment?.razorpay_order_id === payment.order_id);
      if (match && match.status === 'pending') {
        await updateOrder(match.id, { status: 'cancelled', notes: `Payment failed: ${payment.error_description || 'unknown'}` }).catch(() => {});
      }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
