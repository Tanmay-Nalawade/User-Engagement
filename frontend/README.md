# Frontend

## Local dev (Vite) — http://localhost:5173

From this folder:

```bash
npm install
npm run dev
```

Open **http://localhost:5173** (health form), **http://localhost:5173/dashboard** (rewards), and **http://localhost:5173/community** (timeline).

The **Community timeline** loads **1,000 public health alerts** from `public/data/public_alert_messages.json` (no auth or gateway required). Optional: set `VITE_GATEWAY_URL` in `.env` only if you add live API posting later.

The API must be running on **http://localhost:8080** (Docker or local):

```bash
# from project root
docker compose up api
# or: docker run --rm -p 8080:8080 --env-file .env user-engagement-api:latest
```

With an empty `VITE_API_URL` (see `.env.example`), Vite proxies `/interests`, `/health`, and `/api` to port 8080.

---

## Docker UI — http://localhost:3000

From the **project root**:

```bash
docker compose up --build
```

Open **http://localhost:3000**
