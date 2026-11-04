# PEDS HESI 2026

A pediatric HESI practice and study app: mock exams, unfolding cases, growth and development centers (Erikson, Piaget, vital signs), dosage practice and Rapid Review.

It runs in any browser, can be installed on a phone or computer like a regular app, and works offline once it has been opened. Progress is saved on each device in that browser.

## Use the app

[Open PEDS HESI 2026](https://gingiesnaps67.github.io/PEDS-MOCK-HESI/)

This repository publishes through GitHub Pages. Its source is set to **GitHub Actions** under Settings → Pages. Each push to `main` runs type checks, automated tests, and the production build before deploying `site/`.

The app source lives at the repository root. `public-pwa/` contains the icons used by the website; the original root-level icons are retained from the first upload.

## Install it like an app

- **iPhone / iPad (Safari):** open the site → Share → **Add to Home Screen**.
- **Android (Chrome):** open the site → ⋮ menu → **Install app** (or Add to Home screen).
- **Computer (Chrome / Edge):** click the install icon at the right end of the address bar.

## Moving your progress

Progress lives in the browser of each device. To move it: in the old copy go to **Settings → Export progress (JSON)**, then in the new copy **Settings → Import progress…** and pick that file.

## For developers

Use Node.js 24 (matching the deployment workflow).

```bash
npm ci
npm run typecheck
npm test            # unit + UI tests
npm run build:site  # builds the installable site into site/
npm run preview     # serves site/ locally
```

- `src/` — React + TypeScript app (Vite). `src/data/` holds the question bank and study content.
- `scripts/pwa.mjs` — turns the single-file build into the installable site (manifest, offline service worker, self-hosted libraries, icons from `public-pwa/`).
- `.github/workflows/deploy.yml` — test, build and publish to GitHub Pages.

Practice percentages are this app's own transparent scoring. They are not HESI scores and cannot be converted to one.
