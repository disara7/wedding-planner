// import type { PlanningItem } from "../types/planner";
// import { faviconFor, getDomain } from "../lib/getLinkPreview";

// /**
//  * Deterministic pastel SVG used for sample screenshots so a fresh board
//  * looks populated without any network images.
//  */
// function placeholder(seed: string): string {
//   let h = 0;
//   for (let i = 0; i < seed.length; i++) {
//     h = (h << 5) - h + seed.charCodeAt(i);
//     h |= 0;
//   }
//   const n = Math.abs(h);
//   const palettes = [
//     ["#FCECEF", "#E9A6B5"],
//     ["#F6ECF9", "#CBA6E9"],
//     ["#EAF3F1", "#8FC7B8"],
//     ["#FDF1E7", "#E9C29A"],
//   ];
//   const [bg, accent] = palettes[n % palettes.length];
//   const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="${bg}"/><circle cx="${
//     60 + (n % 200)
//   }" cy="${40 + (n % 120)}" r="${70 + (n % 50)}" fill="${accent}" opacity="0.35"/><path d="M0 200 Q 120 ${
//     150 + (n % 50)
//   } 240 190 T 400 180 V260 H0 Z" fill="${accent}" opacity="0.22"/></svg>`;
//   return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
// }

// interface RawItem {
//   category: string;
//   type: "link" | "image";
//   url?: string;
//   title?: string;
//   description?: string;
//   image?: string;
//   note?: string;
//   pinned?: boolean;
// }

// const RAW: RawItem[] = [
//   {
//     category: "photographer",
//     type: "link",
//     url: "https://beautifulmomentsphoto.com",
//     title: "Beautiful Moments Photography",
//     description: "Wedding photography and cinematic storytelling for outdoor celebrations.",
//     pinned: true,
//     note: "Love this photographer's outdoor wedding style.",
//   },
//   {
//     category: "photographer",
//     type: "link",
//     url: "https://facebook.com/beautifulmomentsphoto",
//     title: "Beautiful Moments Photography",
//     description: "Facebook page with recent real weddings and client reviews.",
//   },
//   {
//     category: "photographer",
//     type: "link",
//     url: "https://pinterest.com/search/pins/?q=candid%20wedding%20photography",
//     title: "Candid wedding photography",
//     description: "Pinterest board of relaxed, unposed ceremony and reception moments.",
//   },
//   {
//     category: "photographer",
//     type: "image",
//     image: placeholder("photographer-golden-hour"),
//     title: "Golden hour portrait reference",
//     note: "The warm backlight and film grain is exactly the mood we want.",
//   },
//   {
//     category: "venue",
//     type: "link",
//     url: "https://therosewoodestate.com/weddings",
//     title: "The Rosewood Estate",
//     description: "Garden ceremony lawn and a restored barn reception space for up to 140 guests.",
//   },
//   {
//     category: "venue",
//     type: "link",
//     url: "https://maps.app.goo.gl/rosewood-estate",
//     title: "The Rosewood Estate — directions",
//     description: "Location and parking details on Google Maps.",
//     pinned: true,
//   },
//   {
//     category: "venue",
//     type: "image",
//     image: placeholder("venue-string-lights"),
//     title: "Reception barn inspiration",
//     note: "String lights across the rafters + long farm tables.",
//   },
//   {
//     category: "budget",
//     type: "link",
//     url: "https://docs.google.com/spreadsheets/d/1a2B3c4D5e6F7g8H9i0J/edit",
//     title: "Wedding Budget",
//     description: "Google Sheets · updated recently",
//     pinned: true,
//     note: "Master budget — update after every deposit.",
//   },
//   {
//     category: "decor-flowers",
//     type: "link",
//     url: "https://bloomandsprig.co/portfolio",
//     title: "Bloom & Sprig Florals",
//     description: "Seasonal, garden-style arrangements with lots of texture and trailing greenery.",
//   },
//   {
//     category: "decor-flowers",
//     type: "image",
//     image: placeholder("decor-palette-blush"),
//     title: "Colour palette",
//     note: "Blush, warm white, soft terracotta, sage.",
//   },
//   {
//     category: "dress-attire",
//     type: "link",
//     url: "https://grace-loves-lace.com/collections/wedding-dresses",
//     title: "Grace Loves Lace",
//     description: "Relaxed silhouettes in lace and crepe — several with removable sleeves.",
//   },
//   {
//     category: "catering",
//     type: "link",
//     url: "https://thelongtable.co/weddings",
//     title: "The Long Table",
//     description: "Family-style seasonal menus and a dedicated tasting evening.",
//   },
//   {
//     category: "music-entertainment",
//     type: "link",
//     url: "https://open.spotify.com/playlist/wedding-reception-set",
//     title: "Reception playlist draft",
//     description: "Shared playlist for first dance and party set ideas.",
//   },
//   {
//     category: "invitations",
//     type: "image",
//     image: placeholder("invitations-letterpress"),
//     title: "Letterpress suite reference",
//     note: "Deep press, warm white cotton stock, blush envelope liner.",
//   },
//   {
//     category: "guest-list",
//     type: "link",
//     url: "https://docs.google.com/spreadsheets/d/9z8Y7x6W5v4U3t2S1r0Q/edit",
//     title: "Guest List & RSVPs",
//     description: "Google Sheets · addresses, meal choices and RSVP status.",
//   },
//   {
//     category: "honeymoon",
//     type: "link",
//     url: "https://airbnb.com/rooms/amalfi-coast-villa",
//     title: "Amalfi Coast villa",
//     description: "Two weeks of lemon groves, sea views and slow mornings.",
//     pinned: true,
//   },
//   {
//     category: "honeymoon",
//     type: "image",
//     image: placeholder("honeymoon-amalfi"),
//     title: "Positano at dusk",
//     note: "Adding this to the shortlist.",
//   },
// ];

// /** Build a fresh sample collection. Called on first run and on "reset samples". */
// export function buildSampleItems(): PlanningItem[] {
//   const now = Date.now();
//   return RAW.map((item, i) => ({
//     id: crypto.randomUUID(),
//     category: item.category,
//     type: item.type,
//     url: item.url,
//     title: item.title,
//     description: item.description,
//     image: item.image,
//     favicon: item.type === "link" && item.url ? faviconFor(item.url) : undefined,
//     domain: item.type === "link" && item.url ? getDomain(item.url) : undefined,
//     note: item.note,
//     pinned: !!item.pinned,
//     // Space timestamps out so ordering is stable and newest-first works.
//     createdAt: new Date(now - i * 60_000).toISOString(),
//   }));
// }
