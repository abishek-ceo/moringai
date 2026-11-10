# Moringai

Storefront for [moringai.in](https://moringai.in): moringa powder, capsules, tea, oil, gift sets and seeds, shipped across India.

The deployable site lives in `site/` and is served as-is by Vercel (no build step), with serverless functions in `api/` (orders, Razorpay payments, admin) backed by Supabase. Backend code is outside `site/`, so it is never served as a static file.

## Layout
| Path | What it is |
|---|---|
| `site/` | Everything that is served publicly (Vercel `outputDirectory`) |
| `site/index.html`, `site/public/*.html` | Pages (home, shop, story, benefits, reviews, policies) |
| `site/public/products/*.html` | One page per product (`/products/<slug>`) |
| `site/public/site.css`, `site/public/*.js` | Bundled CSS and scripts (minified) |
| `site/public/icons.svg` | Icon set and product illustrations |
| `site/public/fonts/` | Self-hosted, subsetted WOFF2 fonts |
| `api/`, `lib/` | Serverless API and shared server code |
| `lib/products.js` | Server-side price catalogue (source of truth for checkout) |
| `scripts/` | `check.cjs`, `prerender.cjs`, `stamp.cjs` |
| `tests/` | Backend tests |

## Commands
```bash
npm install
npm run dev        # local server on :3000
npm run check      # syntax-check all JS
npm test           # backend tests
npm run prerender  # refresh the product grid baked into site/index.html and shop.html
npm run stamp      # re-hash css/js URLs in the pages after editing them (run before committing)
```

## Configuration
Copy `.env.example` and set the variables in Vercel. Without them, checkout and admin login fail closed by design.

## Docs
- `MORINGAI_OWNER_INPUT_REQUIRED.md`: business facts and accounts the site still needs
- `docs/MORINGAI_PRODUCTION_AUDIT.md`: what was changed and why

## Deploying
No build runs on Vercel on purpose: a build step makes Vercel add a catch-all that turns every unknown URL into the homepage (soft 404s). After editing `site.css` or a script, run `npm run prerender` (if products changed) and `npm run stamp`, then commit.
