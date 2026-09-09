import type { PlanningItem } from "../types/planner";

const BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
      ...init,
    });
  } catch {
    throw new ApiError("Can't reach the server. Is the API running?", 0);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  hasPassword: boolean;
}

export const api = {
  getConfig: () => request<{ googleClientId: string }>("/config"),

  me: () => request<{ user: AuthUser }>("/auth/me"),
  register: (data: { email: string; password: string; name: string }) =>
    request<{ user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  google: (credential: string) =>
    request<{ user: AuthUser }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),
  logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),

  listItems: () => request<{ items: PlanningItem[] }>("/items"),
  createItem: (data: Partial<PlanningItem>) =>
    request<{ item: PlanningItem }>("/items", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateItem: (id: string, patch: Partial<PlanningItem>) =>
    request<{ item: PlanningItem }>(`/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteItem: (id: string) =>
    request<{ ok: true }>(`/items/${id}`, { method: "DELETE" }),
  clearItems: () => request<{ ok: true }>("/items", { method: "DELETE" }),
  resetSamples: () =>
    request<{ items: PlanningItem[] }>("/items/reset-samples", { method: "POST" }),
};
