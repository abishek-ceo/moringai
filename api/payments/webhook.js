'use strict';
const crypto = require('crypto');
const { readRawBody } = require('../../lib/utils');
const { findOrderByPaymentId, updatePendingOrder } = require('../../lib/db');
const { matchesSignature } = require('../../lib/razorpay');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: 'Webhook is not configured' });
  try {
    const raw = await readRawBody(req);
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    if (!matchesSignature(expected, req.headers['x-razorpay-signature'])) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
    let parsed;
    try { parsed = JSON.parse(raw); } catch { return res.status(400).json({ error: 'Invalid JSON request body' }); }
    const payment = parsed?.payload?.payment?.entity;
    if (parsed?.event !== 'payment.captured' || !payment?.order_id) return res.json({ received: true });
    const order = await findOrderByPaymentId(payment.order_id);
    // Checkout can save after the webhook. Its own gateway verification confirms payment.
    if (!order) return res.json({ received: true });
    if (order.payment_method !== 'razorpay' || payment.status !== 'captured' ||
        payment.currency !== 'INR' || payment.amount !== order.total * 100 ||
        order.payment?.razorpay_payment_id !== payment.id) {
      return res.status(400).json({ error: 'Payment does not match order' });
    }
    // Failed attempts must not cancel an order: another attempt can still succeed.
    await updatePendingOrder(order.id, { status: 'confirmed' });
    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing failed:', err.message);
    return res.status(err.status === 400 ? 400 : 500).json({ error: err.status === 400 ? err.message : 'Webhook processing failed; retry required' });
  }
};
// Preserve raw bytes in runtimes which otherwise parse JSON before the handler.
module.exports.config = { api: { bodyParser: false } };
