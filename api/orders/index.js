'use strict';
const { requireAuth } = require('../../lib/auth');
const { createOrder, getOrders, findOrderByPaymentId } = require('../../lib/db');
const { generateOrderId, readBody, setCORS } = require('../../lib/utils');
const { priceCart } = require('../../lib/products');
const { verifySignature, fetchOrder, fetchPayment, paymentOrderId } = require('../../lib/razorpay');

module.exports = async (req, res) => {
  setCORS(req, res, 'GET, POST, OPTIONS');
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
      const { customer, items, paymentMethod = 'cod', payment } = parsed;
      if (!['cod', 'razorpay'].includes(paymentMethod)) return res.status(400).json({ error: 'Invalid payment method' });
      if (!customer || typeof customer.name !== 'string' || customer.name.trim().length < 2 || customer.name.length > 120 ||
          typeof customer.phone !== 'string' || !/^(?:\+91[ -]?)?[6-9]\d{9}$/.test(customer.phone.replace(/\s/g, '')) ||
          typeof customer.address !== 'string' || customer.address.trim().length < 10 || customer.address.length > 1000 ||
          (customer.email && (typeof customer.email !== 'string' || customer.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)))) {
        return res.status(400).json({ error: 'Enter a valid name, Indian mobile number, delivery address and email (if provided)' });
      }

      if (!customer?.name || !customer?.phone) {
        return res.status(400).json({ error: 'Name and phone number are required' });
      }

      // Authoritative pricing: recompute from the server-side catalog.
      // Client-submitted price/total values are never trusted.
      let priced;
      try {
        priced = priceCart(items);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }

      // An order is only ever marked "confirmed" here after this server has
      // independently verified the payment with Razorpay — never because the
      // client merely claims paymentMethod === 'razorpay'.
      let status = 'pending';
      if (paymentMethod === 'razorpay') {
        const KEY_ID = process.env.RAZORPAY_KEY_ID;
        const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
        if (!KEY_ID || !KEY_SECRET) {
          return res.status(503).json({ error: 'Payment gateway not configured' });
        }
        if (!payment || !verifySignature(payment, KEY_SECRET)) {
          return res.status(400).json({ error: 'Payment signature mismatch — possible tampering' });
        }
        let rzpOrder, rzpPayment;
        try {
          [rzpOrder, rzpPayment] = await Promise.all([
            fetchOrder(payment.razorpay_order_id, KEY_ID, KEY_SECRET),
            fetchPayment(payment.razorpay_payment_id, KEY_ID, KEY_SECRET)
          ]);
        } catch (err) {
          return res.status(502).json({ error: err.message });
        }
        if (rzpOrder.amount !== priced.total * 100 || rzpOrder.currency !== 'INR') {
          return res.status(400).json({ error: 'Payment amount does not match cart total' });
        }
        if (rzpOrder.status !== 'paid' || rzpPayment.status !== 'captured' || rzpPayment.order_id !== payment.razorpay_order_id || rzpPayment.id !== payment.razorpay_payment_id || rzpPayment.amount !== priced.total * 100 || rzpPayment.currency !== 'INR') {
          return res.status(400).json({ error: 'Payment has not been completed' });
        }
        const existing = await findOrderByPaymentId(payment.razorpay_order_id);
        if (existing) return res.json({ success: true, order: { id: existing.id, total: existing.total, status: existing.status }, replayed: true });
        status = 'confirmed';
      }

      const order = {
        id: paymentMethod === 'razorpay' ? paymentOrderId(payment.razorpay_order_id) : generateOrderId(),
        customer: { name: customer.name.trim(), phone: customer.phone.trim(), address: customer.address.trim(), email: customer.email || '' },
        items: priced.items,
        total: priced.total,
        shipping: priced.shipping,
        payment_method: paymentMethod || 'cod',
        payment: paymentMethod === 'razorpay' ? { razorpay_order_id: payment.razorpay_order_id, razorpay_payment_id: payment.razorpay_payment_id } : null,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let saved;
      try { saved = await createOrder(order); }
      catch (err) {
        if (paymentMethod === 'razorpay' && err.code === '23505') {
          const existing = await findOrderByPaymentId(payment.razorpay_order_id);
          if (existing) return res.json({ success: true, order: { id: existing.id, total: existing.total, status: existing.status }, replayed: true });
        }
        throw err;
      }

      // Fire-and-forget email
      try { require('../../lib/email').sendOrderConfirmation(saved).catch(() => {}); } catch (_) {}

      return res.status(201).json({ success: true, order: { id: saved.id, total: saved.total, status: saved.status } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
