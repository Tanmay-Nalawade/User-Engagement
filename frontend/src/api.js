const API_BASE = import.meta.env.VITE_API_URL || "";

export async function createInterests(payload) {
  const res = await fetch(`${API_BASE}/interests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : null;

  if (!res.ok) {
    const message =
      data?.details?.join?.(", ") ||
      data?.error ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (!isJson || !data?.interests?.id) {
    throw new Error(
      "API did not return saved data. Is the API running on port 8080?",
    );
  }

  return data;
}
