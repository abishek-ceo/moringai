const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readOrders() {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')); }
  catch { return []; }
}
function writeOrders(orders) {
  fs.mkdirSync(path.dirname(ORDERS_FILE), { recursive: true });
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}
function generateOrderId() {
  return 'MRG-' + Date.now() + '-' + Math.random().toString(36).substr(2,4).toUpperCase();
}

// ── ORDERS API ─────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  try {
    const { customer, items, total, shipping, paymentMethod, payment } = req.body;
    if (!customer || !items || !items.length) return res.status(400).json({ error: 'Missing order data' });
    const orders = readOrders();
    const order = {
      id: generateOrderId(),
      customer, items, total, shipping,
      paymentMethod: paymentMethod || 'cod',
      payment: payment || null,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    orders.push(order);
    writeOrders(orders);
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.get('/api/orders', (req, res) => {
  const orders = readOrders();
  res.json({ orders });
});

// ── RAZORPAY PAYMENT ──────────────────────────────────────
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return res.status(500).json({ error: 'Razorpay not configured' });
    const { items } = req.body;
    const amount = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = amount >= 499 ? 0 : 49;
    const totalPaise = (amount + shipping) * 100;
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: totalPaise, currency: 'INR', receipt: generateOrderId() })
    });
    const order = await response.json();
    if (!response.ok) return res.status(500).json({ error: order.error?.description || 'Razorpay error' });
    res.json({ success: true, order, key: RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments/verify', (req, res) => {
  try {
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    if (!RAZORPAY_KEY_SECRET) return res.status(500).json({ error: 'Not configured' });
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (expected === razorpay_signature) res.json({ success: true });
    else res.status(400).json({ success: false, error: 'Invalid signature' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SERVE PAGES ───────────────────────────────────────────
['shop', 'benefits', 'story', 'reviews', 'admin'].forEach(page => {
  app.get(`/${page}`, (req, res) => {
    const file = path.join(__dirname, 'public', `${page}.html`);
    if (fs.existsSync(file)) res.sendFile(file);
    else res.redirect('/');
  });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Moringai server running on port ${PORT}`));
