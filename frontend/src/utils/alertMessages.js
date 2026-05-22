const DATA_URL = "/data/public_alert_messages.json";

/** Parse alert date + time for sorting (best-effort). */
export function alertTimestamp(alert) {
  const date = alert.date || "";
  const time = (alert.time || "").replace(" MST", "").trim();
  const parsed = new Date(`${date} ${time}`);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

export function alertToTimelineMessage(alert) {
  const messageRef = `alert-${alert.number}`;

  return {
    messageRef,
    author: `${alert.category} Alert`,
    topic: alert.topic,
    category: alert.category,
    location: alert.location,
    body:
      alert.public_alert_message ||
      [alert.issue, alert.guidance].filter(Boolean).join(" "),
    issue: alert.issue,
    guidance: alert.guidance,
    timestamp: alert.date && alert.time ? `${alert.date} · ${alert.time}` : alert.date,
    timestampSort: alertTimestamp(alert),
    upstampCount: (alert.number * 3) % 47,
    source: "public_alert",
    raw: alert,
  };
}

export function sortAlertsNewestFirst(alerts) {
  return [...alerts].sort((a, b) => alertTimestamp(b) - alertTimestamp(a));
}

export async function loadPublicAlertMessages() {
  const res = await fetch(DATA_URL);
  if (!res.ok) {
    throw new Error(`Could not load alert data (${res.status})`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Alert data must be a JSON array");
  }

  return sortAlertsNewestFirst(data).map(alertToTimelineMessage);
}

export const PAGE_SIZE = 30;

export const SORT_OPTIONS = {
  newest: "Latest first",
  oldest: "Oldest first",
  upstamps: "Most upstamps",
};

/** Milliseconds for sorting (alerts, user posts, ISO timestamps). */
export function getMessageSortTime(msg) {
  if (typeof msg.timestampSort === "number" && msg.timestampSort > 0) {
    return msg.timestampSort;
  }

  if (String(msg.messageRef || "").startsWith("local-")) {
    const ms = Number(String(msg.messageRef).replace("local-", ""));
    if (!Number.isNaN(ms)) return ms;
  }

  const parsed = new Date(msg.timestamp);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

export function sortMessages(messages, order = "newest") {
  const list = [...messages];

  if (order === "oldest") {
    return list.sort((a, b) => getMessageSortTime(a) - getMessageSortTime(b));
  }

  if (order === "upstamps") {
    return list.sort(
      (a, b) =>
        b.upstampCount - a.upstampCount ||
        getMessageSortTime(b) - getMessageSortTime(a),
    );
  }

  return list.sort((a, b) => getMessageSortTime(b) - getMessageSortTime(a));
}

export function filterMessages(messages, { category, locationQuery, search }) {
  const loc = locationQuery?.trim().toLowerCase();
  const q = search?.trim().toLowerCase();

  return messages.filter((msg) => {
    if (category && category !== "all" && msg.category !== category) {
      return false;
    }
    if (loc && !String(msg.location || "").toLowerCase().includes(loc)) {
      return false;
    }
    if (q) {
      const hay = `${msg.topic} ${msg.body} ${msg.location}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
