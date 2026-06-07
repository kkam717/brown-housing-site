# Brown Housing Lottery Demystified

A web app for searching Brown University dorm rooms, reading shared reviews, and exploring campus housing on a map.

## Features

- Search and filter rooms by name, type, size, and location
- Submit and view room reviews
- Interactive campus map
- Contact form

## Local development

### Frontend only

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Without an API URL configured, reviews are stored in the browser only.

### Frontend + API

```bash
# Terminal 1 — API
cd server
npm install
cp ../.env.example .env
npm run migrate
npm run dev

# Terminal 2 — frontend
cd ..
cp .env.example .env
npm run dev
```

Copy `.env.example` to `.env` and fill in the values. See that file for available options.

## Scripts

```bash
npm run dev          # start frontend dev server
npm run build        # production build
npm test             # unit tests
npm run test:e2e     # end-to-end tests

cd server && npm run dev      # start API dev server
cd server && npm run migrate  # run database migration
cd server && npm test         # API tests
```

## Stack

- React + Vite (frontend)
- Express + Postgres (API)
- Static JSON for dorm data
