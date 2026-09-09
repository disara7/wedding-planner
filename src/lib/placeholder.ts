/**
 * Deterministic, offline-safe placeholder artwork as an SVG data URI.
 * Used whenever a link has no OG image or an image fails to load, so the
 * artboard never shows a broken image.
 */
const PALETTES: [string, string][] = [
  ["#FCECEF", "#E9A6B5"],
  ["#F6ECF9", "#CBA6E9"],
  ["#EAF3F1", "#8Fc7B8"],
  ["#FDF1E7", "#E9C29A"],
  ["#EFF1FA", "#A6B0E9"],
];

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function placeholderImage(seed: string): string {
  const n = hash(seed || "wedding");
  const [bg, accent] = PALETTES[n % PALETTES.length];
  const cx = 20 + (n % 60);
  const cy = 20 + ((n >> 3) % 50);
  const r = 26 + (n % 22);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">
    <rect width="400" height="260" fill="${bg}"/>
    <circle cx="${cx * 3}" cy="${cy * 3}" r="${r * 2.4}" fill="${accent}" opacity="0.35"/>
    <circle cx="${400 - cx * 2}" cy="${260 - cy}" r="${r * 1.6}" fill="${accent}" opacity="0.25"/>
    <path d="M0 200 Q 100 ${140 + (n % 60)} 200 190 T 400 180 V260 H0 Z" fill="${accent}" opacity="0.2"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
