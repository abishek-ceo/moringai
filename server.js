const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'moringai123';
const WA_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';
const WA_NOTIFY_NUMBER = process.env.NOTIFY_WHATSAPP || '';
const PORT = process.env.PORT || 3000;

function readOrders() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  } catch { return []; }
}

function writeOrders(orders) {
  fs.mkdirSync(path.dirname(ORDERS_FILE), { recursive: true });
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

async function sendWhatsApp(message) {
  if (!WA_TOKEN || !WA_PHONE_ID || !WA_NOTIFY_NUMBER) return;
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: WA_NOTIFY_NUMBER,
        type: 'text',
        text: { body: message }
      })
    });
    const data = await res.json();
    console.log('WhatsApp sent:', data);
  } catch (err) {
    console.error('WhatsApp error:', err.message);
  }
}

// POST /api/orders
app.post('/api/orders', async (req, res) => {
  const { customer, items, total, shipping, paymentMethod, razorpayPaymentId } = req.body;
  if (!customer || !items || !items.length) {
    return res.status(400).json({ error: 'Invalid order data' });
  }
  const orders = readOrders();
  const order = {
    id: 'MRG-' + Date.now(),
    createdAt: new Date().toISOString(),
    customer,
    items,
    total,
    shipping,
    paymentMethod,
    razorpayPaymentId: razorpayPaymentId || null,
    status: 'new'
  };
  orders.unshift(order);
  writeOrders(orders);

  const itemLines = items.map(i => `  • ${i.name} x${i.qty} = ₹${i.price * i.qty}`).join('\n');
  const waMsg = `🌿 *New Moringai Order!*\n\n*Order ID:* ${order.id}\n*Customer:* ${customer.name}\n*Phone:* ${customer.phone}\n*Address:* ${customer.address}\n\n*Items:*\n${itemLines}\n\n*Total:* ₹${total}\n*Shipping:* ${shipping === 0 ? 'FREE' : '₹' + shipping}\n*Payment:* ${paymentMethod}\n*Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
  await sendWhatsApp(waMsg);

  res.json({ success: true, order });
});

// GET /api/orders (admin)
app.get('/api/orders', (req, res) => {
  const auth = req.headers['x-admin-password'];
  if (auth !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ orders: readOrders() });
});

// PATCH /api/orders/:id (update status)
app.patch('/api/orders/:id', (req, res) => {
  const auth = req.headers['x-admin-password'];
  if (auth !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });
  const orders = readOrders();
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  orders[idx].status = req.body.status || orders[idx].status;
  writeOrders(orders);
  res.json({ success: true, order: orders[idx] });
});

// Admin HTML
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Fallback: serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`🌿 Moringai server running on port ${PORT}`));
