import { clearSession, getToken } from "./auth.js";

export const API_BASE = "/api";

function isPublicRoute(path, method) {
  const cleanPath = path.split("?")[0];
  if (method === "POST" && (cleanPath === "/auth/register" || cleanPath === "/auth/login")) return true;
  if (method === "GET" && (cleanPath === "/polls" || /^\/polls\/[^/]+$/.test(cleanPath))) return true;
  return false;
}

export async function apiFetch(path, options = {}) {
  const method = (options.method ?? "GET").toUpperCase();
  const publicRoute = isPublicRoute(path, method);
  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401 && !publicRoute) {
      clearSession();
    }
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    const error = new Error(payload?.message ?? "Não foi possível concluir a solicitação.");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
