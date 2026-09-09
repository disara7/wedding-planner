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

/**
 * Mobile / tablet replacement for the sidebar: a compact brand row plus a
 * horizontally scrollable category strip. No permanent sidebar on small screens.
 */
export default function MobileCategoryNav({ selected, counts, onSelect, account }: Props) {
  return (
    <div className="mobilenav">
      <div className="mobilenav__brand">
        <span className="sidebar__brand-mark" aria-hidden>
          <Heart size={14} strokeWidth={2.4} />
        </span>
        <span>Wedding Planner</span>
        {account && <div className="mobilenav__account">{account}</div>}
      </div>

      <div className="mobilenav__scroll" role="tablist" aria-label="Planning categories">
        {CATEGORIES.map((cat) => {
          const active = cat.id === selected;
          const count = counts[cat.id] ?? 0;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`mobilenav__chip${active ? " is-active" : ""}`}
              onClick={() => onSelect(cat.id)}
            >
              <CategoryIcon name={cat.icon} size={15} strokeWidth={2} />
              <span>{cat.label}</span>
              <span className="mobilenav__chip-count">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
