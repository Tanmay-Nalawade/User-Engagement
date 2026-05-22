const GATEWAY_BASE = import.meta.env.VITE_GATEWAY_URL ?? "";

export function gatewayUrl(path) {
  return `${GATEWAY_BASE}${path}`;
}

function jsonHeaders() {
  return { "Content-Type": "application/json" };
}

function formatValidationError(data, status) {
  if (!data) {
    return `Request failed (${status})`;
  }

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        const loc = Array.isArray(item.loc) ? item.loc.join(".") : "";
        return loc ? `${loc}: ${item.msg}` : item.msg;
      })
      .join("; ");
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  return (
    data.message ||
    data.error ||
    data.title ||
    `Request failed (${status})`
  );
}

async function parseGatewayResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const err = new Error(formatValidationError(data, res.status));
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data ?? {};
}

export function normalizeMessage(raw, index = 0) {
  const messageRef =
    raw.message_ref ??
    raw.messageRef ??
    raw.ref ??
    raw.id ??
    `msg-${index}`;

  return {
    messageRef: String(messageRef),
    author:
      raw.author ??
      raw.sender ??
      raw.sender_id ??
      raw.client_id ??
      "Community member",
    body: raw.body ?? raw.text ?? raw.content ?? raw.message ?? "",
    timestamp:
      raw.timestamp ??
      raw.created_at ??
      raw.createdAt ??
      raw.sent_at ??
      null,
    upstampCount:
      raw.upstamp_count ??
      raw.upstampCount ??
      raw.upvotes ??
      raw.likes ??
      0,
    raw,
  };
}

export function normalizeMessageList(data) {
  const list =
    data?.messages ??
    data?.items ??
    data?.results ??
    (Array.isArray(data) ? data : []);

  return list.map(normalizeMessage);
}

export async function fetchClientMessages() {
  const res = await fetch(gatewayUrl("/api/v1/client/messages"), {
    headers: jsonHeaders(),
  });

  const data = await parseGatewayResponse(res);
  return normalizeMessageList(data);
}

export async function createServerMessage(payload) {
  const res = await fetch(gatewayUrl("/api/v1/server/messages"), {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({
      body: payload.body,
      text: payload.body,
      content: payload.body,
      author: payload.author,
      sender: payload.author,
    }),
  });

  const data = await parseGatewayResponse(res);
  return normalizeMessage(data?.message ?? data);
}

export async function upstampMessage(messageRef) {
  const res = await fetch(
    gatewayUrl(
      `/api/v1/client/messages/${encodeURIComponent(messageRef)}/upstamp`,
    ),
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({}),
    },
  );

  const data = await parseGatewayResponse(res);
  const count =
    data.upstamp_count ??
    data.upstampCount ??
    data.upvotes ??
    data.likes;

  return count != null ? Number(count) : null;
}
