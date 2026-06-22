'use strict';
// Local development server — mirrors Vercel serverless functions
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Mount API routes (each handler is a Vercel-compatible function)
function route(app, method, path, handler) {
  app[method](path, async (req, res) => {
    try { await handler(req, res); }
    catch (err) { if (!res.headersSent) res.status(500).json({ error: err.message }); }
  });
}

route(app, 'post', '/api/admin/login', require('./api/admin/login'));
route(app, 'get',  '/api/admin/stats', require('./api/admin/stats'));
route(app, 'get',  '/api/orders',      require('./api/orders/index'));
route(app, 'post', '/api/orders',      require('./api/orders/index'));
route(app, 'get',  '/api/orders/:id',  (req, res) => { req.query.id = req.params.id; return require('./api/orders/[id]')(req, res); });
route(app, 'patch','/api/orders/:id',  (req, res) => { req.query.id = req.params.id; return require('./api/orders/[id]')(req, res); });
route(app, 'post', '/api/payments/create-order', require('./api/payments/create-order'));
route(app, 'post', '/api/payments/verify',        require('./api/payments/verify'));
route(app, 'post', '/api/payments/webhook',       require('./api/payments/webhook'));

// Page routes
['shop', 'benefits', 'story', 'reviews', 'admin'].forEach(page => {
  app.get('/' + page, (req, res) => {
    const file = path.join(__dirname, 'public', page + '.html');
    const fs = require('fs');
    if (fs.existsSync(file)) res.sendFile(file);
    else res.redirect('/');
  });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`Moringai running at http://localhost:${PORT}`));
