# 🌿 Moringai — Full-Stack E-commerce

Pure Murungai | India's Moringa Store

## Stack
- **Frontend**: Vanilla HTML/CSS/JS (single page app)
- **Backend**: Node.js + Express
- **Payments**: Razorpay
- **Notifications**: WhatsApp Cloud API
- **Deployment**: Render

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your keys
npm start
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `ADMIN_PASSWORD` | Admin dashboard password |
| `RAZORPAY_KEY_ID` | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `WHATSAPP_TOKEN` | WhatsApp Cloud API token |
| `WHATSAPP_PHONE_ID` | WhatsApp phone number ID |
| `NOTIFY_WHATSAPP` | Your WhatsApp number for order alerts |

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/orders` | POST | Place new order |
| `/api/orders` | GET | Get all orders (admin) |
| `/api/orders/:id` | PATCH | Update order status (admin) |
| `/admin` | GET | Admin dashboard |
| `/health` | GET | Health check |

## Admin Dashboard
Visit `/admin` on your deployed URL and enter your `ADMIN_PASSWORD`.

## Deploy on Render
1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect repo
3. Add environment variables in the Render dashboard
4. Deploy!
