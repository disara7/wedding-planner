import type { ReactNode } from "react";
import { Heart } from "lucide-react";
import { CATEGORIES } from "../data/categories";
import CategoryIcon from "./CategoryIcon";

interface Props {
  selected: string;
  counts: Record<string, number>;
  onSelect: (id: string) => void;
  account?: ReactNode;
}

export default function Sidebar({ selected, counts, onSelect, account }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark" aria-hidden>
          <Heart size={16} strokeWidth={2.4} />
        </span>
        <span className="sidebar__brand-text">Wedding Planner</span>
      </div>

      <nav className="sidebar__nav" aria-label="Planning categories">
        {CATEGORIES.map((cat) => {
          const count = counts[cat.id] ?? 0;
          const active = cat.id === selected;
          return (
            <button
              key={cat.id}
              type="button"
              className={`sidebar__item${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={() => onSelect(cat.id)}
            >
              <CategoryIcon name={cat.icon} size={18} strokeWidth={1.9} className="sidebar__item-icon" />
              <span className="sidebar__item-label">{cat.label}</span>
              <span className="sidebar__item-count">
                {count} {count === 1 ? "item" : "items"}
              </span>
            </button>
          );
        })}
      </nav>

      {account && <div className="sidebar__account">{account}</div>}
    </aside>
  );
}
