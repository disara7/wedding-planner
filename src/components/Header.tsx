import { useEffect, useRef, useState } from "react";
import { LayoutGrid, List, Settings, RotateCcw, Trash2 } from "lucide-react";
import type { Category } from "../types/planner";

export type ViewMode = "grid" | "list";

interface Props {
  category: Category;
  count: number;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onResetSamples: () => void;
  onClearAll: () => void;
}

export default function Header({
  category,
  count,
  view,
  onViewChange,
  onResetSamples,
  onClearAll,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="header">
      <div className="header__titles">
        <h1 className="header__title">{category.label}</h1>
        <p className="header__desc">{category.description}</p>
        <span className="header__count">
          {count} {count === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="header__actions">
        <div className="segmented" role="group" aria-label="View mode">
          <button
            type="button"
            className={`segmented__btn${view === "grid" ? " is-active" : ""}`}
            aria-pressed={view === "grid"}
            aria-label="Grid view"
            onClick={() => onViewChange("grid")}
          >
            <LayoutGrid size={16} strokeWidth={2} />
          </button>
          <button
            type="button"
            className={`segmented__btn${view === "list" ? " is-active" : ""}`}
            aria-pressed={view === "list"}
            aria-label="List view"
            onClick={() => onViewChange("list")}
          >
            <List size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="header__menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="icon-btn"
            aria-label="Settings"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Settings size={16} strokeWidth={2} />
          </button>
          {menuOpen && (
            <div className="menu" role="menu">
              <button
                type="button"
                role="menuitem"
                className="menu__item"
                onClick={() => {
                  onResetSamples();
                  setMenuOpen(false);
                }}
              >
                <RotateCcw size={15} strokeWidth={2} />
                Reset sample content
              </button>
              <button
                type="button"
                role="menuitem"
                className="menu__item menu__item--danger"
                onClick={() => {
                  onClearAll();
                  setMenuOpen(false);
                }}
              >
                <Trash2 size={15} strokeWidth={2} />
                Clear all items
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
