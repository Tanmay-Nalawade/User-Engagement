import { apiUrl, parseJsonResponse } from "../config/apiBase";

export async function fetchDashboard(location) {
  const query = location
    ? `?location=${encodeURIComponent(location)}`
    : "";
  const res = await fetch(apiUrl(`/api/dashboard${query}`));
  const data = await parseJsonResponse(res);

  if (!Array.isArray(data.coupons)) {
    throw new Error(
      "Dashboard data is missing coupons. Rebuild the frontend: docker compose up --build",
    );
  }

  return data;
}

export async function postCheckIn() {
  const res = await fetch(apiUrl("/api/check-in"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  return parseJsonResponse(res);
}
