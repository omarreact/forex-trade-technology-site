# ForexTrade Technology

Complete responsive, prerendered marketing application built from the three supplied JSON specifications. Node 22+; no runtime npm dependencies or installation required.

## Run

```sh
npm run dev
# http://localhost:3000
npm run build
npm test
```

## Included

- All **13 supplied content pages**, preserving their SEO metadata, headings, paragraphs, lists and FAQs.
- A solution directory at `/solutions/`, making 14 published pages. The source's 14th pattern is an **unfilled product template**, not a missing content page; no fabricated product copy is published.
- Six CSS-variable themes, persisted under `forex-theme`, plus keyboard shortcuts 1–6 (disabled while typing), mobile navigation and reduced-motion support.
- Different section compositions: solution cards, numbered processes, feature rows, responsibility columns, connection diagrams, checklists and accessible FAQ disclosures.
- FAQ search, semantic markup, skip link, focus states, canonical URLs, social metadata, favicon, sitemap, robots file and a custom 404.
- Validated consultation form, server-side webhook handler and local enquiry download. No secrets or personal enquiries are stored in the repository or browser storage.

## Authoring

`data/all-14-pages-content.json` is the copy source. `data/global-design-details.json` owns theme tokens and navigation. `data/pages-section-patterns.json` provides the section and additional-product pattern reference. `src/content.mjs` parses source headings into structured sections; `scripts/build.mjs` renders static HTML. Layouts are selected by section semantics rather than repeating one card layout everywhere. Edit the JSON and rebuild.

To add a product, add a complete page object to the content JSON with its real URL, SEO title, meta description, H1 and full text. Use pattern 14's hero, definition, audience, features, process, diagram, benefits, responsibilities, FAQ and final CTA structure. The builder automatically publishes it and adds it to navigation and the sitemap. Literal `/products/[slug]/` is intentionally not published.

Theme typefaces are loaded from Google Fonts with system fallbacks if unavailable. The application does not depend on external JavaScript or image services.

## Consultation delivery

On Vercel, `api/contact.js` is a serverless function. Set **CONTACT_WEBHOOK_URL** to your HTTPS enquiry/CRM automation endpoint and optionally **CONTACT_WEBHOOK_TOKEN** to its bearer token. The handler sends validated name, email, company, country, phone, stage, interests, message and submission time as JSON. Configure appropriate spam/rate controls at the hosting or webhook layer before advertising the form widely.

Until a destination is configured the server returns **503**, and the form clearly explains that it was not sent. “Save enquiry” downloads a text copy and never claims delivery. A static-only host cannot run the API; the same honest fallback applies. Successful delivery means the webhook accepted the request, not that a human has read it. No recipient address or credentials were supplied in the source files.

For local server configuration, export environment variables in your shell before `npm run dev`, or use Node's `--env-file` support. Never commit a real `.env` file.

## Hosting

- **Vercel:** import this repository. `vercel.json` builds `dist/` and exposes the consultation function. Set `SITE_URL` to the chosen canonical origin.
- **Static hosting:** deploy `dist/`. Set `BASE_PATH=/forex-trade-technology-site` and `SITE_URL=https://omarreact.github.io` when building for project-based GitHub Pages. Build default is a domain root.
- **Existing branch-based hosting:** run `npm run export` to refresh the generated HTML/assets in the repository root, then commit them. Original `multi-themes/`, `themed_site/` and ZIP previews are preserved.

The committed root export uses the current GitHub Pages project path, while Vercel builds use the domain-root defaults. CI builds and tests each push and saves a deployable artifact; it does not change hosting account settings.

## Verification

`npm test` checks every supplied page's headings/metadata, internal route links, preservation of narrative copy, theme output, sitemap and enquiry validation/error/success behavior. Webhook success is tested with an in-memory mock; no test enquiry is transmitted externally.
