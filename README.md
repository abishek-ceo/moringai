# 🌿 Moringai – Pure Murungai Powder E-commerce Store

A complete mobile-first e-commerce website for Moringai, built with Node.js + Express.

## Features
- 🛍️ Product catalog with cart functionality
- 💳 Razorpay online payment integration
- 🚚 Cash on Delivery support
- 📱 Mobile-first responsive design
- 💬 WhatsApp order notifications
- 🔐 Admin panel to manage orders
- 📦 Free shipping on orders above ₹499

## Setup

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your keys
4. Run `npm start`

## Environment Variables

```
ADMIN_PASSWORD=your_admin_password
WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_ID=your_phone_id
NOTIFY_WHATSAPP=your_notify_number
RAZORPAY_KEY_SECRET=your_razorpay_secret
PORT=3000
```

## Razorpay Setup
Replace `YOUR_RAZORPAY_KEY_ID` in `public/app.js` with your actual Razorpay Key ID.

## Admin Panel
Visit `/admin` to manage orders. Default password: `moringai2026`

## Deployment
This project is configured for [Render](https://render.com) via `render.yaml`.

---
Made with 💚 in Tamil Nadu
