import { useCallback, useEffect, useMemo, useState } from "react";
import type { PlanningItem } from "../types/planner";
import { api, ApiError } from "../lib/api";
import { getLinkPreview, instantPreview, normalizeUrl } from "../lib/getLinkPreview";
import { CATEGORIES } from "../data/categories";

export interface AddImageInput {
  category: string;
  image: string;
  title?: string;
  note?: string;
}

export function usePlannerItems() {
  const [items, setItems] = useState<PlanningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items } = await api.listItems();
      setItems(items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const patchLocal = useCallback((id: string, patch: Partial<PlanningItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const addLink = useCallback(async (category: string, rawUrl: string) => {
    const url = normalizeUrl(rawUrl);
    const base = instantPreview(url);
    let created: PlanningItem;
    try {
      const res = await api.createItem({
        category,
        type: "link",
        url,
        title: base.title,
        description: base.description,
        domain: base.domain,
        favicon: base.favicon,
      });
      created = { ...res.item, loading: true };
      setItems((prev) => [created, ...prev]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save that link.");
      return;
    }

    try {
      const preview = await getLinkPreview(url);
      const patch = {
        title: preview.title,
        description: preview.description,
        image: preview.image,
        favicon: preview.favicon,
        domain: preview.domain,
      };
      patchLocal(created.id, { ...patch, loading: false });
      await api.updateItem(created.id, patch);
    } catch {
      patchLocal(created.id, { loading: false });
    }
  }, [patchLocal]);

  const addImage = useCallback(async ({ category, image, title, note }: AddImageInput) => {
    try {
      const { item } = await api.createItem({ category, type: "image", image, title, note });
      setItems((prev) => [item, ...prev]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save that image.");
    }
  }, []);

  const updateItem = useCallback(async (id: string, patch: Partial<PlanningItem>) => {
    const before = items.find((it) => it.id === id);
    patchLocal(id, patch);
    try {
      await api.updateItem(id, patch);
    } catch (err) {
      if (before) patchLocal(id, before); // roll back
      setError(err instanceof ApiError ? err.message : "Couldn't save that change.");
    }
  }, [items, patchLocal]);

  const updateNote = useCallback(
    (id: string, note: string) => updateItem(id, { note }),
    [updateItem]
  );

  const togglePin = useCallback(
    (id: string) => {
      const item = items.find((it) => it.id === id);
      if (!item) return;
      return updateItem(id, { pinned: !item.pinned });
    },
    [items, updateItem]
  );

  const removeItem = useCallback(async (id: string) => {
    const snapshot = items;
    setItems((prev) => prev.filter((it) => it.id !== id));
    try {
      await api.deleteItem(id);
    } catch (err) {
      setItems(snapshot); // restore
      setError(err instanceof ApiError ? err.message : "Couldn't delete that item.");
    }
  }, [items]);

  const resetToSamples = useCallback(async () => {
    try {
      // const { items } = await api.resetSamples();
      setItems(items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reset the sample content.");
    }
  }, []);

  const clearAll = useCallback(async () => {
    const snapshot = items;
    setItems([]);
    try {
      await api.clearItems();
    } catch (err) {
      setItems(snapshot);
      setError(err instanceof ApiError ? err.message : "Couldn't clear your items.");
    }
  }, [items]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of CATEGORIES) map[c.id] = 0;
    for (const it of items) {
      if (it.category in map) map[it.category] += 1;
    }
    map.overview = items.length;
    return map;
  }, [items]);

  const itemsFor = useCallback(
    (categoryId: string): PlanningItem[] => {
      const list =
        categoryId === "overview"
          ? items
          : items.filter((it) => it.category === categoryId);
      return [...list].sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        return b.createdAt.localeCompare(a.createdAt);
      });
    },
    [items]
  );

  return {
    loading,
    error,
    dismissError: () => setError(null),
    reload,
    counts,
    itemsFor,
    addLink,
    addImage,
    updateNote,
    updateItem,
    removeItem,
    togglePin,
    resetToSamples,
    clearAll,
  };
}
