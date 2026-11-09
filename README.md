# Moringai

Storefront for [moringai.in](https://moringai.in): moringa powder, capsules, tea, oil, gift sets and seeds, shipped across India.

Static pages in `public/` and `index.html`, served by Vercel, with serverless functions in `api/` (orders, Razorpay payments, admin) backed by Supabase.

## Layout
| Path | What it is |
|---|---|
| `index.html`, `public/*.html` | Pages (home, shop, story, benefits, reviews, policies) |
| `public/products/*.html` | One page per product (`/products/<slug>`) |
| `public/site.css`, `public/*.js` | Bundled CSS and scripts (minified) |
| `public/icons.svg` | Icon set and product illustrations |
| `public/fonts/` | Self-hosted, subsetted WOFF2 fonts |
| `api/`, `lib/` | Serverless API and shared server code |
| `lib/products.js` | Server-side price catalogue (source of truth for checkout) |
| `scripts/` | `build.cjs`, `check.cjs`, `prerender.cjs` |
| `tests/` | Backend tests |

## Commands
```bash
npm install
npm run dev        # local server on :3000
npm run check      # syntax-check all JS
npm test           # backend tests
npm run prerender  # refresh the product grid baked into index.html and shop.html
npm run build      # produce dist/ (versioned assets; backend excluded)
```

## Configuration
Copy `.env.example` and set the variables in Vercel. Without them, checkout and admin login fail closed by design.

## Docs
- `MORINGAI_OWNER_INPUT_REQUIRED.md`: business facts and accounts the site still needs
- `docs/MORINGAI_PRODUCTION_AUDIT.md`: what was changed and why
