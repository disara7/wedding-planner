# Wedding Planner

A single-person wedding planning artboard. Paste links and screenshots and they're
sorted into categories — venue, photographer, budget, guest list, honeymoon and
more — so everything you're collecting for the wedding lives in one place.

It's a **frontend-only** app: no server, no database, no sign-in. Everything you
add is stored in your browser and never leaves your device.

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 18 + TypeScript |
| Build / dev server | Vite 5 |
| Icons | lucide-react |
| Persistence | Browser **IndexedDB** (via a small wrapper in `src/lib/api.ts`) |
| Lightweight state | `localStorage` for the selected category and grid/list view |
| Link previews | [microlink.io](https://microlink.io) from the browser, with a URL-derived fallback when it's unavailable |
| Fonts | Plus Jakarta Sans + Fraunces (Google Fonts) |

No backend, no environment variables, no build-time secrets.

## Running it

```bash
npm install
npm run dev        # Vite dev server (default http://localhost:5173)
```

```bash
npm run build      # type-check + bundle to dist/
npm run preview    # serve the production build locally
```

Deploy the contents of `dist/` to any static host (Netlify, Vercel, GitHub
Pages, S3, …).

## How to use

1. **Pick a category** in the left sidebar (on mobile, the scrollable strip up
   top). "Overview" shows everything at once.
2. **Add a link** — paste a URL into the bar and press Enter (or "Add item").
   A card appears and fills in with the page's title, description, image and
   favicon a moment later.
3. **Add an image** — paste it from the clipboard, drag an image file onto the
   bar, or use "Upload image". Max 6 MB per image. Click an image card to view
   it full size.
4. **Work with a card** — the ⋯ menu on each card lets you **pin to top**,
   **edit** (add or change a note), or **delete**.
5. **Switch views** — the grid/list toggle in the header. Category counts update
   live.
6. **Start over** — the header's settings menu has **Clear all items**.

Your board and every item are saved in the browser's IndexedDB; the selected
category and view are saved in `localStorage`. Clearing the site's data, using a
different browser, or opening the app on another device gives you a fresh, empty
board.

## Features

- Category-based organisation with per-category and total item counts
- Paste, drag-and-drop, or upload — links and images both become cards
- Automatic link previews (title, description, image, favicon) with a graceful
  fallback for sites that can't be fetched
- Per-item notes, pin-to-top, edit and delete
- Full-size image viewer
- Grid and list layouts
- Responsive: sidebar on desktop, category strip on mobile
- Fully offline after first load — all data stays in the browser
