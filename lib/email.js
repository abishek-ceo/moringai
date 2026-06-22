'use strict';
// Email notifications — active only when SMTP_HOST env var is set

async function sendOrderConfirmation(order) {
  if (!process.env.SMTP_HOST) return; // Email not configured — skip silently

  let nodemailer;
  try { nodemailer = require('nodemailer'); }
  catch { return; } // nodemailer not installed — skip

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  const c = order.customer || {};
  const itemLines = (order.items || []).map(i => `  • ${i.name}${i.variant ? ` (${i.variant})` : ''} × ${i.qty}  ₹${(i.price * i.qty).toLocaleString('en-IN')}`).join('\n');
  const method = order.payment_method === 'razorpay' ? 'Online Payment' : 'Cash on Delivery';

  // Customer confirmation
  if (c.email) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: c.email,
      subject: `Order Confirmed ✅ — ${order.id} | Moringai`,
      text: `Hi ${c.name},\n\nYour Moringai order is confirmed!\n\nOrder ID: ${order.id}\nPayment: ${method}\n\nItems:\n${itemLines}\n\nSubtotal: ₹${(order.total - (order.shipping || 0)).toLocaleString('en-IN')}\nShipping: ${order.shipping ? `₹${order.shipping}` : 'FREE'}\nTotal: ₹${order.total.toLocaleString('en-IN')}\n\nDelivery Address:\n${c.address || '—'}\n\nWe will contact you on ${c.phone} with delivery updates.\n\nThank you for choosing Moringai! 🌿\n\n— Team Moringai\n+91 95144 99924`
    }).catch(() => {});
  }

  // Admin notification
  if (process.env.ADMIN_EMAIL) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `🛒 New Order: ${order.id} — ₹${order.total.toLocaleString('en-IN')}`,
      text: `New order received!\n\nID: ${order.id}\nCustomer: ${c.name} | ${c.phone}\nEmail: ${c.email || '—'}\nPayment: ${method}\nTotal: ₹${order.total.toLocaleString('en-IN')}\nShipping: ${order.shipping ? `₹${order.shipping}` : 'FREE'}\n\nItems:\n${itemLines}\n\nAddress: ${c.address || '—'}\n\nManage orders: https://moringai.in/admin`
    }).catch(() => {});
  }
}

module.exports = { sendOrderConfirmation };
