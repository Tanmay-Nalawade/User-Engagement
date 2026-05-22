import { apiUrl, parseJsonResponse } from "../config/apiBase";

export async function fetchDashboard(location, signal) {
  const query = location
    ? `?location=${encodeURIComponent(location)}`
    : "";
  const res = await fetch(apiUrl(`/api/dashboard${query}`), { signal });
  const data = await parseJsonResponse(res);

  if (!Array.isArray(data.coupons)) {
    throw new Error("Dashboard data is missing coupons");
  }

  return data;
}

export async function postCheckIn(signal) {
  const res = await fetch(apiUrl("/api/check-in"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    signal,
  });

  return parseJsonResponse(res);
}
