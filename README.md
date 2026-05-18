# Vulnerability Tracker

A full-stack web app that helps developers monitor **CVE vulnerabilities** for technologies in their stack. Instead of searching the [NIST NVD](https://nvd.nist.gov/) manually, you build a personal watchlist and browse severity-ranked threats on one dashboard.

**Live demo:** [https://inst-377-project-final-philip-montv.vercel.app/](https://inst-377-project-final-philip-montv.vercel.app/)

## Screenshots

| Login | Dashboard |
|-------|-----------|
| ![Login page](docs/screenshots/login.png) | ![Dashboard with CVE cards and CVSS badges](docs/screenshots/dashboard.png) |

| About |
|-------|
| ![About page with project overview and tech stack](docs/screenshots/about.png) |

## Features

- **Supabase Auth** — email/password login with sessions that persist across refresh
- **Technology watchlist** — track up to 5 stack items, validated against NVD
- **CVE dashboard** — per-technology carousel with **CVSS severity** badges (critical → low)
- **Smarter NVD matching** — CPE-aware queries and relevance filtering to reduce false positives
- **Responsive UI** — works on desktop, tablet, and mobile
- **REST API** — Express backend with Supabase Postgres

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 19, Vite, Swiper |
| Backend | Node.js, Express 5 |
| Data & auth | Supabase |
| External API | NIST NVD CVE API 2.0 |
| Deployment | Vercel |

## Architecture

```mermaid
flowchart LR
  Browser[React SPA] -->|REST /api| Express[Express API]
  Express --> Supabase[(Supabase DB)]
  Express --> NVD[NIST NVD API]
  Browser -->|Auth| SupabaseAuth[Supabase Auth]
```

## Quick start

1. Clone the repo and run `npm install`.
2. Copy [.env.example](.env.example) to `.env` and add your keys.
3. Start two terminals:
   - `npm run dev` — Vite frontend (proxies `/api` to port 3000)
   - `npm run server` — Express backend
4. Open the Vite dev URL (usually `http://localhost:5173`).

For API endpoints, manual testing steps, and known limitations, see [docs/README.md](docs/README.md).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL (frontend) |
| `VITE_SUPABASE_KEY` | Supabase anon key (frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (backend) |
| `NVD_API_KEY` | [NIST NVD API key](https://nvd.nist.gov/developers/request-an-api-key) |

## Team

**Ishan Rajan** and **Philip Montvillo** — INST377 Final Project, University of Maryland.

## License

ISC
