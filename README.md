# Brown Housing Lottery Demystified — Portfolio Site

A deployable version of the CS0320 housing search app. Search and filtering run in the browser; reviews are shared via a lightweight Node API on Render with Neon Postgres.

## Features

- Search 1,100+ Brown dorm rooms by name, campus side, or room type
- Filter by occupancy, square footage, campus side, and bathroom type
- Submit and view shared room reviews (Render API + local cache)
- Interactive campus map with dorm markers
- Contact form (emails to kiankamshad717@gmail.com)
- Cold-start guardrails: cached reviews, background sync, optional keep-alive cron

## Quick start

### Frontend only (local dev)

```bash
cd portfolio-site
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Without `VITE_API_URL`, reviews save to localStorage only.

### Full stack (frontend + API)

```bash
# Terminal 1 — API
cd server
npm install
cp ../.env.example .env   # add DATABASE_URL
npm run migrate
npm run dev

# Terminal 2 — frontend
cd ..
cp .env.example .env      # set VITE_API_URL=http://localhost:3001
npm run dev
```

## Environment variables

Copy [`.env.example`](.env.example):

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | Frontend (Vercel/Netlify) | Render API base URL |
| `VITE_MAPBOX_TOKEN` | Frontend | Optional Mapbox token |
| `DATABASE_URL` | Render | Neon Postgres connection string |
| `CORS_ORIGIN` | Render | Frontend URL(s), comma-separated |
| `SMTP_HOST` | Render | e.g. `smtp.gmail.com` for contact form |
| `SMTP_USER` / `SMTP_PASS` | Render | SMTP credentials (Gmail App Password recommended) |
| `CONTACT_TO` | Render | Inbox for contact form (defaults to `kiankamshad717@gmail.com`) |

## Deploy

### 1. Neon Postgres

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the connection string → `DATABASE_URL`

### 2. Render API

1. Push this repo to GitHub
2. Create a **Web Service** from the repo (or use [`render.yaml`](render.yaml))
3. Set `DATABASE_URL` and `CORS_ORIGIN` in Render env vars
4. Deploy — migration runs via `preDeployCommand`

### 3. Frontend (Vercel or Netlify)

1. Connect the same GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set `VITE_API_URL` to your Render URL (e.g. `https://portfolio-site-api.onrender.com`)

### 4. Keep-alive cron (optional, recommended)

Add GitHub secret `RENDER_HEALTH_URL` = `https://your-service.onrender.com/health`

The [keep-alive workflow](.github/workflows/keep-alive.yml) pings every 14 minutes to reduce cold starts on Render's free tier.

## Contact form

Messages are sent to **kiankamshad717@gmail.com**.

- **With API + SMTP** (recommended): set `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` on Render. For Gmail, create an [App Password](https://myaccount.google.com/apppasswords) and use `smtp.gmail.com` on port `587`.
- **Frontend-only fallback**: if the API is unavailable or SMTP is not configured, the form uses FormSubmit.co. The first submission triggers a one-time activation email to confirm the address.

## Cold-start UX

When the Render service is asleep (~15 min idle):

- Listings load instantly from cached review counts
- A banner shows "Connecting to review server…" during warmup
- Review submission retries automatically with a progress indicator
- Hovering the Review button prefetches the API

## Scripts

```bash
npm run dev          # frontend dev server
npm run build        # frontend production build
npm test             # frontend unit tests
npm run test:e2e     # Playwright e2e tests

cd server && npm run dev      # API dev server
cd server && npm run migrate  # run DB migration
cd server && npm test         # API tests
```

## Architecture

- **Frontend:** React 19 + Vite + React Router (static deploy)
- **API:** Express on Render free tier
- **Database:** Neon Postgres (reviews only)
- **Dorm data:** Static JSON in `public/data/` — no backend required
