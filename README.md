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

Duty cards make one request to the existing MINSAL/Farmanet endpoint, filter La Serena and Coquimbo, and display only records dated today in `America/Santiago`. On stale, empty or failed responses, show an explicit notice and the official source instead of claiming that old records are current. City filters use the same response and never show hard-coded pharmacies.

## Verification

`node scripts/visual-qa.cjs` runs a loopback preview and an isolated headless Edge browser using the Codex bundled Playwright package. It checks eight widths (320–1440 px), search, chat, full news expansion, city filters, stale-data exclusion, install help, FAQ, anchors, article layout and the service-worker offline shell. Deterministic API fixtures are used only for interaction tests; screenshots are taken against real API responses. Outputs are ignored by Git. No test news or pharmacy records are written to external services.

Deploy by updating the default branch of `farmaciafarmajovi-max/FarmaJovi`; GitHub Pages serves the static files. Previous Git commits preserve the old design for recovery.
