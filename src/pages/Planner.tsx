import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import type { PlanningItem } from "../types/planner";
import { CATEGORIES, DEFAULT_CATEGORY_ID, getCategory } from "../data/categories";
import { usePlannerItems } from "../hooks/usePlannerItems";
import { useAuth } from "../auth/AuthContext";
import Sidebar from "../components/Sidebar";
import MobileCategoryNav from "../components/MobileCategoryNav";
import Header, { type ViewMode } from "../components/Header";
import PasteArea, { type PasteAreaHandle } from "../components/PasteArea";
import PlanningCard from "../components/PlanningCard";
import EmptyState from "../components/EmptyState";
import ImageModal from "../components/ImageModal";
import AccountMenu from "../components/AccountMenu";

const CATEGORY_KEY = "wedding-planner-artboard:selected";
const VIEW_KEY = "wedding-planner-artboard:view";

function readStored(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export default function Planner() {
  const { user, logout } = useAuth();
  const {
    loading,
    error,
    dismissError,
    reload,
    counts,
    itemsFor,
    addLink,
    addImage,
    updateNote,
    removeItem,
    togglePin,
    resetToSamples,
    clearAll,
  } = usePlannerItems();

  const [selected, setSelected] = useState<string>(() => {
    const stored = readStored(CATEGORY_KEY, DEFAULT_CATEGORY_ID);
    return CATEGORIES.some((c) => c.id === stored) ? stored : DEFAULT_CATEGORY_ID;
  });
  const [view, setView] = useState<ViewMode>(
    () => (readStored(VIEW_KEY, "grid") === "list" ? "list" : "grid")
  );
  const [modalItem, setModalItem] = useState<PlanningItem | null>(null);

  const pasteRef = useRef<PasteAreaHandle>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORY_KEY, selected);
    } catch {
      /* ignore */
    }
  }, [selected]);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* ignore */
    }
  }, [view]);

  const category = getCategory(selected);
  const items = useMemo(() => itemsFor(selected), [itemsFor, selected]);

  const handleSelect = (id: string) => {
    setSelected(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const account = user && <AccountMenu user={user} onLogout={logout} />;

  return (
    <div className="app">
      <Sidebar selected={selected} counts={counts} onSelect={handleSelect} account={account} />

      <main className="main">
        <MobileCategoryNav
          selected={selected}
          counts={counts}
          onSelect={handleSelect}
          account={account}
        />

        <div className="main__inner">
          <Header
            category={category}
            count={items.length}
            view={view}
            onViewChange={setView}
            onResetSamples={resetToSamples}
            onClearAll={clearAll}
          />

          <PasteArea
            ref={pasteRef}
            categoryLabel={category.label}
            onAddLink={(url) => addLink(selected, url)}
            onAddImage={(dataUrl) => addImage({ category: selected, image: dataUrl })}
          />

          {error && (
            <div className="banner banner--error" role="alert">
              <span>{error}</span>
              <div className="banner__actions">
                <button type="button" onClick={reload}>
                  Retry
                </button>
                <button type="button" aria-label="Dismiss" onClick={dismissError}>
                  <X size={15} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="board-loading">
              <Loader2 size={22} className="spin" />
              <span>Loading your artboard…</span>
            </div>
          ) : items.length === 0 ? (
            <EmptyState icon={category.icon} onAddFirst={() => pasteRef.current?.focus()} />
          ) : (
            <div className={view === "grid" ? "board board--grid" : "board board--list"}>
              {items.map((item) => (
                <PlanningCard
                  key={item.id}
                  item={item}
                  onSaveNote={updateNote}
                  onDelete={removeItem}
                  onTogglePin={togglePin}
                  onOpenImage={setModalItem}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ImageModal item={modalItem} onClose={() => setModalItem(null)} />
    </div>
  );
}
