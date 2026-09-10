# Wedding Planner

A single-person wedding planning artboard. Paste links and images, and they're
organized into categories (venue, photographer, budget, honeymoon…).

This is a **frontend-only** app: no server, no database, no accounts. Everything
you add is saved in your browser's IndexedDB and stays on your device. Clearing
the site's data (or a different browser/profile) starts a fresh board.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build     # outputs static files to dist/
npm run preview   # serve the production build locally
```

Deploy `dist/` to any static host.
