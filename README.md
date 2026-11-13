# FarmaJovi official website

Static GitHub Pages site. No build or package installation is required.

## Visual system

- `index.html`: semantic, responsive homepage. There is one price-search module.
- `redesign.css`: shared homepage and article design, including mobile navigation, chat and install help.
- `catalog.js`: original catalog, price search and chat, extracted unchanged from the previous homepage.
- `website.js`: icons, navigation, accessible chat state, published news, Farmanet and real PWA installation.
- `noticia.html` / `noticia.js`: full published articles using the same news source as the administrative panel.
- `site-insights.js`: existing anonymous interaction reporting; use `?fj_preview=1` to exclude preview traffic.
- `sw.js`: network-first app shell and offline fallback. Bump the cache name and asset query strings when changing the shell.

The original logos and pharmacy images are preserved. Images depicting the project's proposed appearance are labelled as visualizations. The project-pause notice remains visible.

## Data integrity

News reads published rows from the existing Supabase `news` table. This redesign does not alter records, credentials, policies or the administrative panel. The browser publishable key is not an administrative secret.

Coquimbo duty cards make one request to the existing MINSAL/Farmanet endpoint and display only records dated today in `America/Santiago`. Stale, empty or failed responses show an explicit notice and the official source. La Serena instead shows the two continuous 24-hour pharmacies (official registry IDs 3580 and 5990), separately labelled, with full addresses, official map coordinates, directions and attributed directory telephone contacts. They are not described as a daily duty or as verified open in real time; users are asked to confirm before travelling. Those two cards remain accessible if the Coquimbo service fails or the app is offline.

## Verification

`node scripts/visual-qa.cjs` runs a loopback preview and an isolated headless Edge browser using the Codex bundled Playwright package. It checks eight widths (320–1440 px), search, chat, full news expansion, city filters, stale-data exclusion, install help, FAQ, anchors, article layout and the service-worker offline shell. Deterministic API fixtures are used only for interaction tests; screenshots are taken against real API responses. Outputs are ignored by Git. No test news or pharmacy records are written to external services.

Deploy by updating the default branch of `farmaciafarmajovi-max/FarmaJovi`; GitHub Pages serves the static files. Previous Git commits preserve the old design for recovery.

## Administration

`admin.html`, `admin.css` and `admin.js` provide the protected administration interface. `admin-insights.js` reads the existing interaction format and renders the overview and paginated activity without counting keyword labels as a second action. The authenticated administrator email allowlist, Supabase Auth destination, database tables and RLS permissions are unchanged. No access token is saved to local storage or printed to the console; local sign-out preserves the previous behavior without revoking other devices.

News now has a single set of create/edit/archive/delete handlers. New items default to not published; the checkbox and save button clearly describe visibility. Publication and archiving have confirmations. Permanent deletion requires typing `ELIMINAR`, explains that there is no trash, and suggests archiving instead. Unsaved edits have discard protection. A preview uses text nodes, and external image previews only load on explicit request. The `published` boolean is still the only visibility field: archived records and unsubmitted drafts are both labelled "No publicada", without inventing new database statuses.

Run `node scripts/admin-qa.cjs` to test with completely intercepted API fixtures. It verifies authorization gates, known metric totals, filters and pagination, single-write behavior on double submit, editing with PATCH rather than POST, archive/republish, typed deletion confirmation, previews, unsaved changes, error recovery and responsive widths. It never writes real news or statistics. Screenshots of the authenticated test dashboard carry an explicit simulated-data banner; production checks should use the sign-in page without requesting a real session.
