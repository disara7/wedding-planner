import type { Category } from "../types/planner";

export const CATEGORIES: Category[] = [
  {
    id: "overview",
    label: "Overview",
    description: "A snapshot of everything you're collecting across your wedding plans.",
    icon: "LayoutGrid",
  },
  {
    id: "venue",
    label: "Venue",
    description: "Save venues, locations and site inspiration you want to remember.",
    icon: "MapPin",
  },
  {
    id: "photographer",
    label: "Photographer",
    description: "Collect photographers, inspiration, packages and ideas in one place.",
    icon: "Camera",
  },
  {
    id: "videographer",
    label: "Videographer",
    description: "Films, reels and videographers whose style you love.",
    icon: "Video",
  },
  {
    id: "dress-attire",
    label: "Dress & Attire",
    description: "Dresses, suits, shoes and accessories for the whole wedding party.",
    icon: "Shirt",
  },
  {
    id: "decor-flowers",
    label: "Decor & Flowers",
    description: "Florals, colour palettes, table settings and styling ideas.",
    icon: "Flower2",
  },
  {
    id: "catering",
    label: "Catering",
    description: "Caterers, menus, cakes and tastings to compare.",
    icon: "UtensilsCrossed",
  },
  {
    id: "music-entertainment",
    label: "Music & Entertainment",
    description: "Bands, DJs, playlists and entertainment for the celebration.",
    icon: "Music",
  },
  {
    id: "invitations",
    label: "Invitations",
    description: "Stationery, save-the-dates and invitation design inspiration.",
    icon: "Mail",
  },
  {
    id: "budget",
    label: "Budget",
    description: "Keep your budget spreadsheet and money notes close by.",
    icon: "Wallet",
  },
  {
    id: "guest-list",
    label: "Guest List",
    description: "Guest spreadsheets, RSVPs and seating ideas.",
    icon: "Users",
  },
  {
    id: "honeymoon",
    label: "Honeymoon",
    description: "Destinations, hotels and experiences for life after the wedding.",
    icon: "Plane",
  },
];

export const DEFAULT_CATEGORY_ID = "photographer";

export function getCategory(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
