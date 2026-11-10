# Moringai Production Audit

Branch: `fix/moringai-production-audit` (based on `main` @ `c41dcc5`)
Date: September 2026

This audit was run alongside a second AI session ("Codex") working on the
same branch. Codex owned
backend/payment-security/testing infrastructure; this report's author owned
storefront content, product discoverability, SEO, compliance copy, and
accessibility. Findings below are combined and de-duplicated.

## 1. What was wrong

- **Backend source code was publicly downloadable in production.** With no
  build step, Vercel served the entire repo root as static files —
  `https://moringai.in/server.js`, `/lib/auth.js`, etc. all returned 200
  with full source (confirmed via `curl` against the live site before this
  fix).
- **Checkout trusted client-submitted prices.** `POST /api/orders` and the
  Razorpay order-creation endpoint priced carts from whatever `price` the
  browser sent, not a server-side catalogue — a tampered request could pay
  ₹1 for any product, or record a fake COD total.
- **Orders could be marked "confirmed" without verifying payment.** The
  order-save endpoint trusted a client-supplied `paymentMethod: 'razorpay'`
  flag; nothing tied it to an actual verified, captured Razorpay payment.
- **Webhook accepted unsigned requests** when `RAZORPAY_WEBHOOK_SECRET` was
  unset, and read an already-JSON-parsed body for signature verification
  (a byte-mismatch bug that could make valid signatures fail).
- **No admin auth guardrails in production.** `ADMIN_PASSWORD`/`JWT_SECRET`
  silently fell back to `admin123` / a hardcoded string if unset.
- **CORS was wide open** (`Access-Control-Allow-Origin: *`) on every API,
  including the admin endpoints.
- **The COD checkout UI lied on failure.** `placeOrder()` showed a success
  toast and emptied the cart even when the server rejected the order or the
  network request failed outright.
- **No individual product pages existed.** The shop grid was rendered
  entirely client-side with no `<a href>` per product, no `/products/*`
  routes, and product JSON-LD pointed at a URL fragment (`/shop#products`)
  instead of a real page — the single biggest gap against
  discoverability/Merchant Center readiness.
- **Fabricated social proof throughout:** a "4.9★ / 10K+ Happy Customers /
  200+ Partner Farmers" hero stat block, hardcoded per-product
  `rating`/`reviews` counts (1247, 863, 512…) with no backing data, six
  invented customer testimonials (`REVIEWS` array with fake names/quotes),
  and matching fake `AggregateRating`/`Review` JSON-LD on the homepage,
  shop page, and reviews page.
- **Unsupported certification and medical claims:** "FSSAI Certified"
  (FSSAI licenses/registers, it doesn't certify), "100% Organic" /
  "Certified Organic" with no certifying body or number anywhere in the
  project, "Lab Tested" / "heavy metals tested every batch" with no
  certificate or lab name, and therapeutic claims — "boosts immunity",
  "supports healthy blood sugar & cholesterol", "improves sleep quality",
  "anti-inflammatory & detoxifying" — plus an FAQ claiming specific
  before/after result timelines (2–3 weeks, 4–6 weeks, 6–8 weeks) and a
  pricing FAQ answer (₹349/₹549/₹899) that didn't match the real catalogue
  (₹299 flat).
- **Stale duplicate homepage** at `public/index.html` — an older, weaker
  draft (no canonical tag, thinner metadata) that was still statically
  reachable at `/public/index.html`, a duplicate-content risk.
- Dead files: `public/admin.js` (a single stray comment, unreferenced),
  root `script.js`/`styles.css` (0 bytes, unreferenced, GitHub Pages-era
  leftovers per the old README).
- No `robots.txt` disallow for `/admin`, no `noindex` on the admin page.
- `nodemailer@6.9.7` had a high-severity advisory.
- No `main` landmark on any page; footer used `<h4>` with no `<h3>`
  anywhere, breaking heading order; several text/background combinations
  (footer captions, price badges, breadcrumb) failed WCAG contrast; no
  `prefers-reduced-motion` handling for the particle/leaf/aurora/cursor/tilt
  JS effects (a blanket CSS `prefers-reduced-motion` rule already zeroed
  animation durations, but the JS still ran mousemove listeners and spawned
  DOM nodes regardless).
- No policy pages existed at all — footer linked "Contact Us / Shipping
  Policy / Return Policy / Privacy Policy" to `href="#"`, and
  "Certifications" / "Blog" links also went nowhere.

## 2. What was changed

### Discoverability & product pages (the critical task)
- Added `slug` to the product catalogue (`public/app.js`, `lib/products.js`)
  and rewrote `renderProducts()` so every card is a real `<a href="/products/<slug>">`
  wrapping the image and name — crawlable without JS execution being required
  to *discover* the link (though the grid itself is still client-rendered;
  see remaining-work note below).
- Built six static product pages, `public/products/<slug>.html`, each with:
  unique title/description/canonical/OG/Twitter tags, breadcrumb + `Product`
  JSON-LD (no fabricated rating/review fields), variant selector, quantity
  stepper, Add to Cart + Buy Now, ingredients, how-to-use, storage,
  shipping/returns summary, a manufacturer/FSSAI info card that's honest
  about the missing licence number, and a "you may also like" cross-sell row.
- Wired `/products/<slug>` in `vercel.json` (rewrites) and `server.js`
  (local dev), with a 404 fallback for unknown slugs.
- Added `public/contact.html`, `privacy-policy.html`, `terms.html`,
  `shipping-policy.html`, `refund-policy.html` and routed them the same way.
  Footer links across every page now point to real URLs instead of `#`.
  Content uses only facts already in the repo (WhatsApp number, founder
  name, Tamil Nadu sourcing regions, the real ₹499 free-shipping threshold
  and 30-day return window already encoded in the app) — every genuinely
  missing fact (FSSAI number, GSTIN, legal entity, address, email,
  confirmed shipping/refund timelines) is called out inline as pending and
  listed in `MORINGAI_OWNER_INPUT_REQUIRED.md`, not invented.
- Added `404.html` (styled to match the brand) registered as a build-output
  root file and as the Express catch-all/product-slug fallback.

### FSSAI / organic / medical-claims cleanup
- "FSSAI Certified" → "FSSAI Licensed" everywhere (accurate terminology;
  the licence *number* is not displayed anywhere since none exists in the
  project — flagged for the owner).
- "100% Organic" / "Certified Organic" → "Naturally Grown" (no certifying
  body/number exists in the repo); "Lab Tested" / "heavy metal tested every
  batch" → "Quality Checked" / an honest in-house-check description,
  dropping the implied third-party lab claim.
- Rewrote all six homepage/benefits "health benefits" bullets away from
  medical-outcome claims (immunity boost, blood sugar/cholesterol,
  sleep, anti-inflammatory/detox) into traditional-use / nutritional /
  practical-usage framing.
- Rewrote the homepage FAQ: removed the "results in 2–3/4–6/6–8 weeks" claim
  entirely, fixed the price FAQ to the real ₹299 catalogue price (was
  ₹349/₹549/₹899, which didn't exist anywhere in the actual product data),
  softened the FSSAI FAQ to not claim "independently lab tested… certificate
  on request" (unverifiable), and kept the medication-interaction caution
  (a safety disclaimer, not a benefit claim) with tighter wording.
- Removed the "200+ organic farms/farmers" fabricated counts throughout
  (hero, why-section, heritage, story, meta descriptions, JSON-LD
  Organization descriptions) in favour of non-quantified "small farms" /
  "farming families" language.
- FAQPage JSON-LD on the homepage was rewritten to exactly match the
  visible FAQ answers (previously already in sync structurally, now in sync
  on content too).

### Fabricated social proof removed
- Hero "4.9★ / 10K+ Happy Customers / 100% Pure Organic / 200+ Partner
  Farmers" stat row replaced with four verifiable, non-quantified pillars:
  Tamil Nadu Sourced / FSSAI Licensed / COD Available / Free Shipping ₹499+.
- Removed `rating`/`reviews` fields from every product in `public/app.js`
  and the rating-stars/review-count line from product cards.
- Emptied the `REVIEWS` array (was six invented testimonials with fake
  names/locations/quotes) and rewrote `renderReviews()` to show an honest
  "we're a young brand — verified reviews will appear here soon" state
  instead — used on both the homepage's reviews teaser and the `/reviews`
  page's own grid.
- Removed all `aggregateRating` fields from the `ItemList`/`Product`
  JSON-LD on `index.html` and `public/shop.html` (was fake ratings +
  review counts per product), and deleted the entire fabricated `Product` +
  `AggregateRating` + six-`Review` JSON-LD block from `public/reviews.html`.
- Rewrote the `/reviews` page hero/section copy ("Loved by Thousands", "4.9★
  Average Rating") to non-quantified language, in both raw HTML and the
  `public/i18n.js` dictionary (English and Tamil) that overwrites it at
  runtime — both had to be changed since the i18n script re-applies its own
  copy over the DOM on load.
- Fixed the product JSON-LD `offers.url` to point at the new real product
  pages instead of a `#products` fragment.

### Bilingual consistency
Every English copy change above was mirrored in the Tamil (`ta`) half of
`public/i18n.js` — the site's language toggle re-renders text from this
dictionary, so an English-only fix would have left the Tamil version
making the old claims.

### Security
- **Server-side price authority**: new `lib/products.js` exports the
  canonical catalogue and a `priceCart()` that recomputes price/variant/qty
  from item *names* only, ignoring client-submitted prices/totals. Wired
  into `api/orders/index.js` and `api/payments/create-order.js`. Verified
  with a unit test and a manual tampered-price request (₹1 submitted,
  ₹299 charged).
- **Razorpay verification hardened** (`lib/razorpay.js`): constant-time
  signature comparison, strict `order_…`/`pay_…` ID format validation, and
  the order-save endpoint now independently fetches both the Razorpay order
  *and* payment objects to confirm amount, currency, capture status, and
  order/payment binding before ever marking an order "confirmed" — it no
  longer trusts a client-supplied payment method flag.
- **Idempotency**: deterministic order IDs derived from the Razorpay order
  ID, a DB lookup by payment ID, and conditional "only update pending
  orders" webhook writes, so retried payments/webhooks can't double-record
  or regress a shipped/cancelled order.
- **Webhook fails closed**: rejects if `RAZORPAY_WEBHOOK_SECRET` is unset
  (previously accepted unsigned requests), reads the true raw request body
  before Express's JSON parser touches it (`bodyParser: false` +
  `req.rawBody`) so signature verification is byte-accurate, and only ever
  confirms a matching *pending* order.
- **Admin auth fails closed in production**: `JWT_SECRET`/`ADMIN_PASSWORD`
  throw if unset when `NODE_ENV`/`VERCEL_ENV` is `production`, instead of
  falling back to `admin123`/a hardcoded secret; dev-only fallbacks remain
  for local `npm run dev`. Token verification now uses
  `crypto.timingSafeEqual` and validates JWT header alg/type.
- **CORS restricted** to `https://moringai.in` (+ `www` + localhost dev)
  instead of `*`, so a stolen/guessed admin bearer token can't be replayed
  cross-origin from another site.
- **Backend source no longer publicly served**: `scripts/build.cjs` builds
  a `dist/` containing only `index.html`, `404.html`, `robots.txt`,
  `sitemap.xml`, and `public/` — `vercel.json` now sets
  `"outputDirectory": "dist"` and `"buildCommand": "npm run build"`.
  `server.js` (local dev) now only serves `/public` + explicit root files,
  never the repo root. Confirmed via a fresh `npm run build` that no
  backend file or secret-referencing string ends up in `dist/`.
- **Input validation** added on `POST /api/orders`: name length, Indian
  mobile number format, address length, email format, payment-method
  allowlist — malformed/negative/fractional quantities are rejected rather
  than silently coerced.
- **nodemailer bumped** `^6.9.7` → `^10.0.9` (fixes a high-severity
  advisory). `express` bumped to the latest 4.x; the remaining moderate
  `qs` advisory only affects the local-dev-only Express server (Vercel
  runs the `api/*.js` handlers directly, not `server.js`) and would require
  an Express 5 migration to fully clear — left as-is with this noted,
  rather than an unnecessary breaking upgrade for a dev convenience script.
- Added `.env.example` (variable names only, no values) and confirmed no
  real credentials exist anywhere in the repo (`git-tracked` or otherwise).
- Added `Permissions-Policy` and `Strict-Transport-Security` headers;
  `X-Robots-Tag: noindex` + a `<meta name="robots" content="noindex,
  nofollow">` on `/admin`; `robots.txt` now disallows `/admin` and `/api/`.
  **CSP intentionally not added**: the codebase relies extensively on
  inline `onclick="…"` handlers and inline `style="…"` attributes across
  every page; a CSP strict enough to matter would need `'unsafe-inline'`
  (little real protection) or a large refactor moving every handler to
  `addEventListener`. Documented here rather than shipping a CSP that
  either does nothing or breaks Razorpay/onclick-driven UI.
- Checkout UI (`placeOrder()` in `public/app.js`) now validates delivery
  details client-side, requires an explicit `{success:true, order:{id}}`
  from the server, and leaves the cart/form untouched on any failure —
  verified in the browser: a submission against an unconfigured database
  surfaced the real backend error and the cart was preserved.

### Backend regression tests (new)
`tests/auth.test.cjs`, `tests/cart.test.cjs`, `tests/payments.test.cjs` —
17 tests covering: production credential enforcement, token
tampering/expiry, catalogue price override of tampered client input,
invalid product/variant/quantity rejection, Razorpay signature/amount/
capture verification, replay/idempotency, webhook signature enforcement
and status-regression protection. All 17 pass (`npm test`).

### Performance & accessibility
- Added `prefers-reduced-motion` guards in `public/effects.js` around the
  particle field, falling-leaf animation, aurora background blobs,
  cursor-follow glow, 3D card tilt, and magnetic-button effects — these are
  JS `mousemove`/`setInterval`-driven and weren't covered by the existing
  blanket CSS `@media (prefers-reduced-motion: reduce)` animation-duration
  reset. Click ripple and scroll-reveal fades are left on (minimal, brief).
- Added a `<main>` landmark to every page and fixed footer heading order
  (`<h4>` → `<h3>`, and product-page info-card headings `<h3>` → `<h2>`
  where they were the first sub-heading after `<h1>`).
- Fixed six text/background colour-contrast failures (footer tagline/
  origin/copyright/badges, mobile sticky-bar item count, struck-through
  and discount-badge price text) to meet WCAG AA (4.5:1).
- Lighthouse (local, headless Chrome via `npx lighthouse`) on the built
  site: **Home** — Performance 99, Accessibility 100, Best Practices 96,
  SEO 100. **Product page** — 100 / 100 / 96 / 100. **Shop** — 99 / 100 /
  96 / 100. The Best Practices 96 is a Razorpay checkout.js third-party
  cookie notice in Chrome's Issues panel — outside this codebase's control.
- Removed the two 0-byte dead root files (`script.js`, `styles.css`) and
  the unreferenced `public/admin.js` stray comment file.

### Technical SEO
- `sitemap.xml` expanded from 5 URLs to 16 (added all six product pages
  and five new policy/contact pages), dates refreshed, still excludes
  cart/checkout/admin/search-style URLs.
- `robots.txt`: added `Disallow: /admin` and `Disallow: /api/`, kept the
  sitemap reference.
- Every indexable page has a self-referencing canonical to
  `https://moringai.in/...`; confirmed no `noindex`, no `localhost`
  references, and no missing canonicals across all 17 public HTML pages
  (scripted check).
- 301 redirect added for the now-deleted stale `/public/index.html` →
  `/`, so any external link/cached index entry consolidates to the real
  homepage instead of erroring.
- Manifest description updated to drop "100% organic… FSSAI certified…
  pesticide-free" language to match the rest of the compliance cleanup.

## 3. Testing performed

- `npm run check` — syntax-checks all 23 backend/script JS files. Pass.
- `npm test` — 17 backend regression tests (Codex-authored, covering
  everything in the Security section above). Pass.
- `npm run build` — builds `dist/`; confirmed no `server.js`/`lib/*.js`/
  `api/*.js`/secrets end up in the output.
- Scripted crawl of every internal `href`/`src` across all 17 public pages
  (43 unique URLs) against the local server — zero broken links or images.
- Scripted check of canonical/robots/localhost-leak across all pages —
  clean.
- JSON-LD syntax validated (parsed with `JSON.parse`) on every page that
  carries structured data — all valid.
- Manual browser testing (this session's Browser pane, against
  `npm run dev` on port 3055): homepage, shop grid → product page → cart →
  checkout modal → COD order submission (correctly surfaced a real backend
  error and preserved the cart, rather than the old fake-success bug);
  variant selection and quantity stepper on a product page; mobile
  viewports at 320px/375px — no horizontal overflow on any page tested.
- `sitemap.xml` parsed and validated as well-formed XML with 16 URLs.
- Repo-wide final sweep for the full banned-phrase list (medical claims,
  organic/certification claims, fabricated ratings/counts) — clean.
- Repo-wide sweep for `TODO`/`FIXME` and common secret-key patterns
  (`sk_live_`, `rzp_live_`, PEM private keys, etc.) — none found.
- `git diff`/`git status` reviewed for accidental deletions — only the
  four confirmed-dead files above were removed.

## 4. Files created/modified

**Created**: `.env.example`, `404.html`, `MORINGAI_OWNER_INPUT_REQUIRED.md`,
`lib/products.js`, `lib/razorpay.js`, `public/contact.html`,
`public/privacy-policy.html`, `public/terms.html`,
`public/shipping-policy.html`, `public/refund-policy.html`,
`public/products/{moringa-leaf-powder,moringa-capsules,moringa-tea-blend,
moringa-seed-oil,moringa-gift-set,raw-moringa-seeds}.html`,
`scripts/build.cjs`, `scripts/check.cjs`, `tests/*.test.cjs`
(Codex-authored).

**Modified**: `index.html`, `public/{shop,story,benefits,reviews,admin}.html`,
`public/{app.js,i18n.js,effects.js,fix.css,manifest.json}`,
`api/**/*.js`, `lib/{auth,db,utils}.js`, `server.js`, `vercel.json`,
`robots.txt`, `sitemap.xml`, `package.json`, `.gitignore`.

**Deleted**: `public/admin.js`, `public/index.html`, `script.js`,
`styles.css` (all confirmed dead/unreferenced).

## 5. DONE / OWNER INPUT REQUIRED / EXTERNAL DASHBOARD ACTION REQUIRED

**DONE** — everything in sections 2 and 3 above.

**OWNER INPUT REQUIRED** (see `MORINGAI_OWNER_INPUT_REQUIRED.md` for full
detail and exact file locations): FSSAI licence number; organic
certification evidence if one genuinely exists; legal entity name; GSTIN;
registered business address; support email address; confirmed
shipping/refund processing timelines; real product photography; lab-backed
nutrition data if stronger nutrient claims are wanted.

**EXTERNAL DASHBOARD ACTION REQUIRED**: set the production environment
variables on Vercel (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`,
`ADMIN_PASSWORD`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
`RAZORPAY_WEBHOOK_SECRET`, optional `SMTP_*`) — without these, checkout
and admin login fail closed by design; register the Razorpay webhook URL;
Google Search Console verification + sitemap submission; Google Merchant
Center setup (structured data is ready, pending real product photos);
analytics (GA4/GTM/Meta Pixel) if wanted — none is currently configured
anywhere in the project.

## 6. Not done / deliberately deferred

- Product images remain a stylized emoji tile (no real packaging
  photography exists in the repo — fabricating some was explicitly out of
  scope).
- No CSP was added (see Security section for why).
- Express's transitive `qs` moderate advisory (local dev server only) was
  left rather than forcing an Express 5 migration.
- Analytics event wiring (`view_item`/`add_to_cart`/etc.) was not added
  since no tracking ID exists to attach it to.

## 7. Deployment

Not deployed. This branch has not been pushed, and no preview/production
deployment was created — per instructions, that decision is left to the
owner. Recommended next step: review this branch, supply the items in
`MORINGAI_OWNER_INPUT_REQUIRED.md` (at minimum the Vercel environment
variables, or checkout will 503), then merge and deploy.
