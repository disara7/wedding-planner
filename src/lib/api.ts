import type { PlanningItem } from "../types/planner";
// import { buildSampleItems } from "../data/sampleItems";

/**
 * Local, single-person data store.
 *
 * This app has no backend and no accounts. Every planning item lives in the
 * browser's IndexedDB (not localStorage — pasted images are multi-MB base64
 * data URLs and would blow the localStorage quota almost immediately).
 *
 * The exported `api` keeps the same method names the rest of the app already
 * calls, so `usePlannerItems` and the components didn't need to change.
 */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const DB_NAME = "wedding-planner";
const STORE = "items";
const DB_VERSION = 1;
/** Set once the board has been populated (or deliberately emptied) so we never re-seed. */
const SEED_FLAG = "wedding-planner:initialized";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new ApiError("This browser has no local storage available.", 0));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new ApiError("Couldn't open local storage.", 0));
  });
  return dbPromise;
}

function readAll(): Promise<PlanningItem[]> {
  return openDb().then(
    (db) =>
      new Promise<PlanningItem[]>((resolve, reject) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
        req.onsuccess = () => resolve(req.result as PlanningItem[]);
        req.onerror = () => reject(new ApiError("Couldn't read your items.", 0));
      })
  );
}

function readOne(id: string): Promise<PlanningItem | undefined> {
  return openDb().then(
    (db) =>
      new Promise<PlanningItem | undefined>((resolve, reject) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
        req.onsuccess = () => resolve(req.result as PlanningItem | undefined);
        req.onerror = () => reject(new ApiError("Couldn't read that item.", 0));
      })
  );
}

/** Run a set of mutations in one readwrite transaction. */
function write(run: (store: IDBObjectStore) => void): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        run(tx.objectStore(STORE));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(new ApiError("Local storage write failed.", 0));
        tx.onabort = () => reject(new ApiError("Local storage write failed.", 0));
      })
  );
}

function sortItems(items: PlanningItem[]): PlanningItem[] {
  return [...items].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

function seedFlagSet(): boolean {
  try {
    return localStorage.getItem(SEED_FLAG) != null;
  } catch {
    return false;
  }
}

function markSeeded(): void {
  try {
    localStorage.setItem(SEED_FLAG, "1");
  } catch {
    /* private mode / storage disabled — worst case we re-seed an empty board */
  }
}

/** On the very first run, drop the sample collection into an empty board. */
async function ensureSeeded(): Promise<void> {
  if (seedFlagSet()) return;
  const existing = await readAll();
  if (existing.length === 0) {
    // const samples = buildSampleItems();
    // await write((store) => samples.forEach((it) => store.put(it)));
  }
  markSeeded();
}

function normalizeNew(data: Partial<PlanningItem>): PlanningItem {
  return {
    id: crypto.randomUUID(),
    category: String(data.category ?? ""),
    type: data.type === "image" ? "image" : "link",
    url: data.url,
    title: data.title,
    description: data.description,
    image: data.image,
    favicon: data.favicon,
    domain: data.domain,
    note: data.note,
    pinned: !!data.pinned,
    createdAt: new Date().toISOString(),
  };
}

export const api = {
  listItems: async (): Promise<{ items: PlanningItem[] }> => {
    await ensureSeeded();
    return { items: sortItems(await readAll()) };
  },

  createItem: async (data: Partial<PlanningItem>): Promise<{ item: PlanningItem }> => {
    const item = normalizeNew(data);
    await write((store) => store.put(item));
    markSeeded();
    return { item };
  },

  updateItem: async (
    id: string,
    patch: Partial<PlanningItem>
  ): Promise<{ item: PlanningItem }> => {
    const current = await readOne(id);
    if (!current) throw new ApiError("Item not found.", 404);
    const { id: _id, createdAt: _createdAt, loading: _loading, ...fields } = patch;
    const next: PlanningItem = { ...current, ...fields };
    if ("pinned" in patch) next.pinned = !!patch.pinned;
    delete next.loading;
    await write((store) => store.put(next));
    return { item: next };
  },

  deleteItem: async (id: string): Promise<{ ok: true }> => {
    await write((store) => store.delete(id));
    return { ok: true };
  },

  clearItems: async (): Promise<{ ok: true }> => {
    await write((store) => store.clear());
    markSeeded();
    return { ok: true };
  },

  // resetSamples: async (): Promise<{ items: PlanningItem[] }> => {
  //   // const samples = buildSampleItems();
  //   await write((store) => {
  //     store.clear();
  //     // samples.forEach((it) => store.put(it));
  //   });
  //   markSeeded();
  //   return { items: sortItems(samples) };
  // },
};
