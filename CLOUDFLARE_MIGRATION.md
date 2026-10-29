# Cloudflare staging migration (29 October 2026)

This branch is for testing the independent Cloudflare Pages deployment; do not attach or replace `forextrade.pincodeit.com` until smoke and asset checks pass.

- GitHub source: `omarreact/forex-trade-technology-site`
- Cloudflare Pages project: `cf-migrate-forex-site`
- Deployment URL (once built): `https://cf-migrate-forex-site.pages.dev/`
- Install: `npm install`
- Build: `npm run build`
- Publish directory: `dist`
- Build-time environment: `SITE_URL=https://cf-migrate-forex-site.pages.dev` for preview metadata (not a secret).
- Vercel project environment: no user-defined variables found at audit time.

## Validation gates

1. Cloudflare's GitHub installation can read this repository and create a preview deployment from this branch.
2. Build finishes with a successful status. Generated `dist/index.html` and every linked asset exist.
3. Home, contact, about, FAQ and internal links return expected HTTP statuses on `pages.dev`.
4. Layout and responsive behavior visually match the Vercel baseline.
5. No CORS/mixed-content issues; browser console errors reviewed.
6. Only after confirmation: assign custom production hostname and verify SSL, redirects and rollback.

Preserve Vercel until the cutover is specifically confirmed.
