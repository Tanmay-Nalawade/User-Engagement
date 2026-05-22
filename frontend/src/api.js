import { apiUrl, parseJsonResponse } from "./config/apiBase";

export async function createInterests(payload) {
  const res = await fetch(apiUrl("/interests"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(res);

  if (!data?.interests?.id) {
    throw new Error(
      "API did not return saved data. Is the API running? Try: docker compose up --build",
    );
  }

  return data;
}
