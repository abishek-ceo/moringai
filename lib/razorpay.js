'use strict';
const crypto = require('crypto');

function matchesSignature(expected, supplied) {
  if (typeof supplied !== 'string' || !/^[a-f0-9]{64}$/.test(supplied)) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(supplied, 'hex'));
}

function verifySignature(payment, keySecret) {
  if (!keySecret || !payment || typeof payment !== 'object') return false;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payment;
  if (!/^order_[a-zA-Z0-9]+$/.test(razorpay_order_id || '') || !/^pay_[a-zA-Z0-9]+$/.test(razorpay_payment_id || '')) return false;
  const expected = crypto.createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  return matchesSignature(expected, razorpay_signature);
}

async function fetchEntity(type, id, keyId, keySecret) {
  const res = await fetch(`https://api.razorpay.com/v1/${type}/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}` },
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error('Could not verify payment with Razorpay');
  return res.json();
}
const fetchOrder = (id, keyId, keySecret) => fetchEntity('orders', id, keyId, keySecret);
const fetchPayment = (id, keyId, keySecret) => fetchEntity('payments', id, keyId, keySecret);

// One persistent primary key per gateway order also protects concurrent retries.
function paymentOrderId(id) {
  return `MRG-RZP-${crypto.createHash('sha256').update(id).digest('hex').slice(0, 32).toUpperCase()}`;
}
module.exports = { verifySignature, fetchOrder, fetchPayment, paymentOrderId, matchesSignature };
