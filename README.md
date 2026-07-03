# AEGIS — AI Cybersecurity Intelligence Platform

A premium, ethical cybersecurity platform: an **AI news aggregator**, a **live CVE
explorer**, and **unified threat search** — wrapped in a futuristic hacker UI with
a Matrix backdrop, neon theming, and Three.js.

> **Milestone 1 (this build): a deep, production-grade vertical slice.**
> News aggregation + AI summaries + CVE Explorer + Search + Dashboard are fully
> functional. CTF, Bug Bounty, Learning, Blog, Admin and Analytics ship as
> structured "coming soon" routes so the shell is complete and they slot in
> later without restructuring.

## Ethics & attribution (non-negotiable)

- We **summarize, attribute, and link** — we **never republish** full copyrighted
  articles. Only the title, a short excerpt (≤ ~50 words), metadata, and our
  **own** AI/extractive summary are stored and displayed.
- Every article prominently links to the original source ("Read original →").
- The ingester identifies itself with a real User-Agent and respects timeouts.
- For ethical, educational, and defensive use.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion ·
Three.js · Supabase (optional) · OpenAI (optional) · Zod.

## Quick start (zero config)

```bash
npm install
npm run dev      # http://localhost:3000
```

It runs immediately with **no accounts and no keys**: data comes from a local
file-backed JSON store (`.data/`) seeded from `data/seed/`, and summaries use a
deterministic extractive fallback.

Pull **live** news at any time:

```bash
npm run ingest   # fetches real RSS, dedups, summarizes, persists to .data/
```

Re-running `ingest` is **idempotent** — duplicates are dropped by content hash +
near-duplicate title similarity.

## Configuration (all optional)

Copy `.env.example` → `.env.local` and fill in what you have. Nothing is
required; each integration degrades gracefully.

| Variable | Effect when set |
| --- | --- |
| `OPENAI_API_KEY` (+ `OPENAI_MODEL`) | LLM summaries + categorization (else extractive fallback) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Enables Supabase Auth (magic link) |
| `SUPABASE_SERVICE_ROLE_KEY` | Switches the data backend from local JSON → Supabase |
| `NVD_API_KEY` | Higher NVD rate limits for the CVE Explorer |
| `CRON_SECRET` | Protects `/api/cron/ingest` (Vercel Cron sends it as a Bearer token) |

The backend is chosen **at runtime**: with `NEXT_PUBLIC_SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY` present it uses Supabase; otherwise the local store.
No code changes needed to switch.

### Supabase setup

1. Create a project at supabase.com.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor (tables,
   indexes, full-text search, and RLS policies).
3. Put the URL + anon + service-role keys in `.env.local`.

## Architecture

```
app/                 # App Router pages + API routes
  news/ cve/ search/ dashboard/ auth/   # live modules
  ctf/ bounty/ learn/ blog/ admin/ analytics/  # roadmap stubs
  api/               # cron/ingest, search, newsletter, bookmarks, notifications, health
components/          # layout, fx (MatrixRain/HeroScene), ui, news, cve, dashboard
lib/
  repo/              # Repository interface + LocalRepository + SupabaseRepository
  ingest/            # sources, rss, dedup, pipeline
  ai/                # OpenAI enrichment + deterministic fallback
  cve/               # NVD 2.0 client (+ cache)
  search/ security/ seo/ auth/ utils/
data/seed/           # local seed data
supabase/schema.sql  # database schema + RLS
scripts/             # ingest.ts, seed.ts
```

Everything reads/writes through **one `Repository` interface** with two
implementations, so features are backend-agnostic.

## Automation

- **Hourly ingestion** via Vercel Cron (`vercel.json` → `/api/cron/ingest`,
  guarded by `CRON_SECRET`).
- Locally: `npm run ingest` (or hit the route with `?secret=`).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run ingest` | Run the ingestion pipeline (live RSS) |
| `npm run seed` | Materialize/verify the local store |

## Security

- Security headers (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy,
  Permissions-Policy) in `next.config.ts`.
- Zod validation + in-memory rate limiting on API routes.
- Supabase Row Level Security policies for all user data.
- `/api/health` reports backend + AI mode.

## Roadmap (next milestones)

CTF Arena · Bug Bounty Hub · Learning paths · Full blog aggregation · Admin
dashboard · Threat analytics · Email delivery (Resend) · Vercel deploy.

## License / use

For ethical and educational use. All third-party trademarks and content belong
to their respective owners; AEGIS links to and attributes all sources.
