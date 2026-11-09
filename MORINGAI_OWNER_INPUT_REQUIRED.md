# Owner input required

This file lists business facts and external-account setup that this audit
deliberately did **not** invent. Everywhere one of these is missing, the
copy has been written to be accurate without it (e.g. "FSSAI licensed" with
no number shown, rather than a fabricated licence number). Nothing below
already exists elsewhere in the repository — this is not a duplicate of
information already on the site.

## Legal / compliance facts

1. **FSSAI licence/registration number.**
   Used in: footer trust line (optional), each product page's
   "Manufacturer & FSSAI" info card (`public/products/*.html`), the
   homepage FAQ answer "Is Moringai FSSAI licensed?" (`index.html`). The
   site currently states *"FSSAI Licensed"* / *"FSSAI licensed, as required
   for food businesses in India"* without a number — this is accurate but
   incomplete. Once supplied, add the number next to these mentions.

2. **Organic certification (NPOP / PGS-India / India Organic / Jaivik
   Bharat), if genuinely held.**
   No certificate, certifying body name, or registration number exists
   anywhere in the project, so all "100% Organic" / "Certified Organic"
   claims were rewritten to non-certified language ("Naturally Grown").
   If Moringai does hold a real organic certification, supply the
   certifying body and registration number and the "Naturally Grown"
   copy can be restored to a properly worded organic claim with the
   required logo/number, in: `index.html`, `public/shop.html`,
   `public/story.html`, `public/benefits.html`, `public/reviews.html`,
   `public/i18n.js`, `public/products/*.html`.

3. **Legal entity name** (company/proprietorship name as registered).
   Used in: `public/terms.html`, `public/privacy-policy.html`,
   `public/contact.html`, footer copyright line (currently just "Moringai").

4. **GSTIN.**
   Used in: `public/terms.html`, `public/privacy-policy.html`, and any
   future invoice/order-confirmation output.

5. **Registered business address.**
   Used in: `public/contact.html`, `public/terms.html`,
   `public/privacy-policy.html`, and the FSSAI-required
   manufacturer/marketer address on each product page
   (`public/products/*.html`, "Manufacturer & FSSAI" card).

6. **Support email address.**
   No email address exists anywhere in this project — WhatsApp
   (+91 95144 99924) is the only contact channel currently published.
   Used in: `public/contact.html`, `public/privacy-policy.html` (data
   request contact), and ideally a Razorpay merchant support contact.

## Policy specifics

7. **Confirmed order-dispatch/delivery timeline** (in business days) and
   named courier partner(s).
   Used in: `public/shipping-policy.html`, product page "Shipping &
   Returns" card. The current free-shipping-above-₹499 and COD-availability
   statements are backed by the actual cart logic (`FREE_SHIPPING_THRESHOLD`
   in `public/app.js` / `lib/products.js`) and were preserved as-is; only
   the *delivery-days* promise was left for the owner to confirm.

8. **Confirmed refund/return processing timeline** (in business days).
   Used in: `public/refund-policy.html`. The 30-day return *window* was
   already stated consistently across the existing site (trust badges,
   certs sections) and was preserved; only the refund *processing* time
   was left open.

## Product content

9. **Real product photography** (packaging/label shots).
   Products currently use a custom line-art illustration per category
   (`public/icons.svg`, `art-*` symbols) — a deliberate choice to avoid
   fabricating photography that doesn't exist. Real photos will materially
   improve conversion and are close to required for Google Merchant Center.
   When available, add them as the `image` field in each product's JSON-LD
   (`Product.image`) and swap them into the product card and `.pdp-gallery`.

10. **Nutrition panel data** (lab-verified, per pack) if you want to make
    specific quantified nutrient claims beyond the general "moringa is a
    source of vitamin C, calcium, potassium, iron" language now used.
    Used in: product pages "Ingredients" section, homepage FAQ.

## External accounts / dashboards (not code changes)

11. **Google Search Console** — verify domain ownership and submit
    `https://moringai.in/sitemap.xml`.
12. **Google Merchant Center** — set up a product feed; the site's
    structured data (name/price/currency/availability/canonical URL) is
    ready to support this, pending real product images (#9) and shipping
    policy specifics (#7).
13. **Analytics** — no GA4, GTM, or Meta Pixel is configured anywhere in
    this project. If you want conversion/traffic analytics, provide a
    tracking ID and it can be wired to fire `view_item` / `add_to_cart` /
    `begin_checkout` / `purchase` events consistently across the storefront.
14. **Production environment variables** on Vercel (see `.env.example` for
    the full list — names only, no values are stored anywhere in this
    repo): `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ADMIN_PASSWORD`,
    `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
    `RAZORPAY_WEBHOOK_SECRET`, and optionally the `SMTP_*` variables for
    order-confirmation email. Without these, checkout and the admin
    dashboard fail closed (they return clear errors rather than silently
    using insecure defaults) — see `MORINGAI_PRODUCTION_AUDIT.md` for what
    changed here.
15. **Razorpay webhook URL** — point a webhook for `payment.captured` to
    `https://moringai.in/api/payments/webhook` in the Razorpay dashboard,
    using the same secret set as `RAZORPAY_WEBHOOK_SECRET`.
