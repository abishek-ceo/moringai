'use strict';
// Local development server — mirrors Vercel serverless functions
const express = require('express');
const compression = require('compression');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const SITE = path.join(__dirname, 'site');

app.use(compression());
app.use(express.json({ limit: '64kb', verify(req, res, buffer) { req.rawBody = Buffer.from(buffer); } }));
app.use('/public', express.static(path.join(SITE, 'public'), {
  setHeaders(res, filePath) {
    if (/\.(mp4|webm|jpg|jpeg|png|svg|woff2?)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    } else if (/\.(css|js)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=3600');
    }
  }
}));

// Only intentional root files are public; never serve backend source or package metadata.
['robots.txt', 'sitemap.xml'].forEach(file => {
  app.get('/' + file, (req, res) => res.sendFile(path.join(SITE, file)));
});

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
['shop', 'benefits', 'story', 'reviews', 'admin', 'privacy-policy', 'terms', 'shipping-policy', 'refund-policy', 'contact'].forEach(page => {
  app.get('/' + page, (req, res) => {
    const file = path.join(SITE, 'public', page + '.html');
    const fs = require('fs');
    if (fs.existsSync(file)) res.sendFile(file);
    else res.redirect('/');
  });
});

const PRODUCT_SLUGS = ['moringa-leaf-powder', 'moringa-capsules', 'moringa-tea-blend', 'moringa-seed-oil', 'moringa-gift-set', 'raw-moringa-seeds'];
app.get('/products/:slug', (req, res) => {
  const fs = require('fs');
  if (!PRODUCT_SLUGS.includes(req.params.slug)) return res.status(404).sendFile(path.join(SITE, '404.html'));
  const file = path.join(SITE, 'public', 'products', req.params.slug + '.html');
  if (fs.existsSync(file)) res.sendFile(file);
  else res.status(404).sendFile(path.join(SITE, '404.html'));
});

app.get('/', (req, res) => res.sendFile(path.join(SITE, 'index.html')));

app.use((req, res) => res.status(404).sendFile(path.join(SITE, '404.html')));

app.listen(PORT, () => console.log(`Moringai running at http://localhost:${PORT}`));
