# DEVFORGE AI

**Build. Debug. Ship. With AI.**
An AI-powered software engineering and product development workspace — idea → planning → UI/UX → project management → development → debugging → testing → security → documentation → GitHub → deployment → portfolio → learning.

This repository is a real, working foundation for that product, built on a free-tier-friendly stack. It is **not** a hollow demo: authentication, the database, the AI calls, and the core CRUD flows are functional. Where a feature genuinely needs infrastructure this environment can't provision (GitHub OAuth, a sandboxed code executor, live Vercel deploy status), the UI says so explicitly instead of faking it — see "Honest scope" below.

---

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + React Router + Monaco Editor
- **Backend:** Vercel Serverless Functions (`/api`)
- **Data/Auth:** Supabase (PostgreSQL + Auth), Row Level Security on every user-owned table
- **AI:** Gemini API (default), OpenAI or OpenRouter as alternates — all keys are server-only, tried in order (Gemini → OpenAI → OpenRouter), or forced with `AI_PROVIDER`
- **Repo/Deploy:** GitHub + Vercel

No VPS, no paid database, no Docker server, no Redis server, and no dedicated execution server are required to run the core app.

---

## 1. Setup

### 1.1 Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` from this repo. It creates every table, index, and RLS policy the app needs.
3. Copy your Project URL, anon key, and service role key from Project Settings → API.

### 1.2 Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
# or, instead:
# OPENAI_API_KEY=...
```

Only one provider key is required. If you set more than one, `api/_lib/providers.ts` tries them in order (Gemini → OpenAI → OpenRouter) and falls through on failure. Force a specific one with `AI_PROVIDER=openai` (or `gemini` / `openrouter`).

`VITE_`-prefixed variables are the only ones exposed to the browser. Never put a secret behind that prefix.

### 1.3 Install & run

```bash
npm install
npm run dev        # starts the Vite dev server on :5173
vercel dev          # in a second terminal, serves /api on :3000 (see vite.config.ts proxy)
```

Or deploy directly: push to GitHub, import the repo at vercel.com/new, and set the same environment variables in the Vercel project settings.

---

## 2. What's real vs. what's an honest stub

| Area | Status |
|---|---|
| Auth (signup/login/logout/reset) | **Real** — Supabase Auth, session persistence, protected routes |
| Database schema + RLS | **Real** — `supabase/schema.sql`, enforced server-side |
| Projects, Tasks (Kanban), Bugs | **Real CRUD** against Supabase |
| Idea Lab | **Real** — calls Gemini via `/api/ai/idea`, key never leaves the server |
| Code Studio (Monaco + AI chat) | **Real** — files persist to `project_files`; AI chat calls `/api/ai/chat` with project-scoped context and membership checks |
| Security Center | **Real, narrow** — client-side pattern scan for common secret leaks in stored files. Not a substitute for a dedicated SAST/secrets tool |
| UI/UX Studio, Documentation, Database Studio, Learning | **Real** AI generation, no persistence layer beyond what's shown |
| Testing Center | **Honest stub** — Vercel Serverless Functions are not a persistent execution environment. The UI states this plainly rather than fabricating pass/fail results. Wire up an optional sandbox executor to get real results |
| Deployment Center | **Honest stub** — shows `CONFIGURATION_REQUIRED` until connected to the Vercel API; never shows a fake "Online" status |
| GitHub integration | **Honest stub** — needs `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` and an OAuth flow this scaffold doesn't implement yet |
| Portfolio | **Real CRUD**, public/private toggle |

This distinction is deliberate and matches the product's own design rule: *never present fake results.*

---

## 3. Security notes

- `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and GitHub secrets are read only inside `/api/**`, which runs server-side. They are never bundled into client code.
- Every AI endpoint verifies the caller's Supabase session token server-side (`api/_lib/auth.ts`) — a request can't claim to be a different user.
- Project membership is re-checked server-side before any project-scoped AI request is answered.
- Untrusted content (project files, user-typed ideas) is explicitly separated from system instructions in every prompt sent to Gemini, to resist prompt injection.
- Rate limiting and input-size limits are enforced server-side (`api/_lib/limits.ts`) and are never trusted from the client. The current implementation is in-memory per function instance — durable, cross-instance limiting needs an external store (e.g. Upstash Redis), which is optional, not required.

## 4. Extending this scaffold

Natural next additions, roughly in priority order:
1. GitHub OAuth + repo import/push (`api/github/*`)
2. A sandbox execution provider for real test/build output
3. Multi-file AI diffs with accept/reject per file
4. Realtime collaboration on top of the existing owner/member/viewer schema
5. A dependency manager that reads `package.json`/lockfiles from imported repos

---

**Tagline:** From idea to production, with an AI engineering workspace built around you.
