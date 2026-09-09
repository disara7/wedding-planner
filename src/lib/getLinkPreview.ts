import type { LinkPreview } from "../types/planner";

/**
 * Link preview abstraction.
 *
 * Browser CORS rules mean most sites can't be scraped directly from the
 * frontend, so this module has two layers:
 *
 *   1. `instantPreview(url)` — synchronous, always works. Derives a domain +
 *      friendly title from the URL itself and recognises common services
 *      (Facebook, Instagram, Pinterest, Google Sheets/Maps, YouTube...).
 *
 *   2. `getLinkPreview(url)` — async. Starts from the instant preview and tries
 *      to enrich it with real OpenGraph metadata from a pluggable remote
 *      resolver. If that fails for any reason it resolves with the instant
 *      preview — it never rejects, so broken metadata can't break the UI.
 *
 * To move preview generation to your own backend later, replace
 * `remoteResolver` with a function that calls your endpoint.
 */

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isProbablyUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value || /\s/.test(value)) return false;
  try {
    const u = new URL(normalizeUrl(value));
    return u.hostname.includes(".");
  } catch {
    return false;
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function faviconFor(url: string): string {
  const domain = getDomain(url);
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

interface ServiceHint {
  match: RegExp;
  name: string;
  describe?: (url: string) => string;
}

const SERVICE_HINTS: ServiceHint[] = [
  { match: /facebook\.com/i, name: "Facebook", describe: () => "Facebook page" },
  { match: /instagram\.com/i, name: "Instagram", describe: () => "Instagram profile or post" },
  { match: /pinterest\.[a-z.]+/i, name: "Pinterest", describe: () => "Pinterest inspiration" },
  { match: /docs\.google\.com\/spreadsheets/i, name: "Google Sheets", describe: () => "Google Sheets · updated recently" },
  { match: /docs\.google\.com\/document/i, name: "Google Docs", describe: () => "Google Docs document" },
  { match: /(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i, name: "Google Maps", describe: () => "Location on Google Maps" },
  { match: /(youtube\.com|youtu\.be)/i, name: "YouTube", describe: () => "Video on YouTube" },
  { match: /vimeo\.com/i, name: "Vimeo", describe: () => "Film on Vimeo" },
  { match: /(airbnb\.[a-z.]+)/i, name: "Airbnb", describe: () => "Stay on Airbnb" },
  { match: /(etsy\.com)/i, name: "Etsy", describe: () => "Etsy shop or listing" },
];

function titleCaseFromUrl(url: string): string {
  try {
    const u = new URL(normalizeUrl(url));
    const segments = u.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? "";
    const cleaned = decodeURIComponent(last)
      .replace(/\.[a-z0-9]{1,5}$/i, "")
      .replace(/[-_+]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
    if (cleaned && cleaned.length > 2) return cleaned;
    const host = u.hostname.replace(/^www\./, "");
    const brand = host.split(".")[0];
    return brand.replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return url;
  }
}

export function instantPreview(rawUrl: string): LinkPreview {
  const url = normalizeUrl(rawUrl);
  const domain = getDomain(url);
  const hint = SERVICE_HINTS.find((h) => h.match.test(url));
  return {
    url,
    domain,
    favicon: faviconFor(url),
    title: hint ? `${hint.name} · ${domain}` : titleCaseFromUrl(url),
    description: hint?.describe?.(url) ?? `Saved from ${domain}`,
    image: undefined,
  };
}

/** Pluggable remote resolver. Swap this for a call to your own backend. */
type RemoteResolver = (url: string) => Promise<Partial<LinkPreview>>;

const microlinkResolver: RemoteResolver = async (url) => {
  const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(url)}&audio=false&video=false`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(endpoint, { signal: controller.signal });
    if (!res.ok) return {};
    const body = (await res.json()) as {
      status?: string;
      data?: {
        title?: string;
        description?: string;
        publisher?: string;
        url?: string;
        image?: { url?: string };
        logo?: { url?: string };
      };
    };
    if (body.status !== "success" || !body.data) return {};
    const d = body.data;
    return {
      title: d.title || d.publisher || undefined,
      description: d.description || undefined,
      image: d.image?.url || undefined,
      favicon: d.logo?.url || undefined,
    };
  } catch {
    return {};
  } finally {
    clearTimeout(timeout);
  }
};

let remoteResolver: RemoteResolver = microlinkResolver;

/** Allows tests or a future backend integration to override the resolver. */
export function setLinkPreviewResolver(resolver: RemoteResolver | null): void {
  remoteResolver = resolver ?? (async () => ({}));
}

export async function getLinkPreview(rawUrl: string): Promise<LinkPreview> {
  const base = instantPreview(rawUrl);
  try {
    const remote = await remoteResolver(base.url);
    return {
      ...base,
      title: remote.title?.trim() || base.title,
      description: remote.description?.trim() || base.description,
      image: remote.image || base.image,
      favicon: remote.favicon || base.favicon,
    };
  } catch {
    return base;
  }
}
