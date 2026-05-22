/** Empty = same origin (nginx / vite proxy). Set VITE_API_URL only for direct API access. */
export const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

export async function parseJsonResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      data?.error ||
      data?.details?.join?.(", ") ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (!isJson || data === null) {
    throw new Error(
      "API returned an invalid response. Start the full stack with: docker compose up --build",
    );
  }

  return data;
}
