export type ItemType = "link" | "image";

export interface PlanningItem {
  id: string;
  category: string;
  type: ItemType;
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  domain?: string;
  note?: string;
  pinned?: boolean;
  /** Set while a link preview is being fetched so the UI can show a skeleton. */
  loading?: boolean;
  createdAt: string;
}

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  domain: string;
}

export interface Category {
  id: string;
  label: string;
  description: string;
  /** Lucide icon name resolved in CategoryIcon. */
  icon: string;
}
