# postman-lite

A self-built, lightweight clone of Postman — create workspaces, organize requests into collections, execute real HTTP requests, and inspect the results. Built from scratch to deeply understand full-stack fundamentals: auth, relational data modeling, external API proxying, caching, and containerized deployment.

**Live demo:** [postman-lite-nine.vercel.app](https://postman-lite-nine.vercel.app/)

---

## Why I built this

I wanted to actually understand how a full-stack app fits together end to end , from a JWT being verified on the server, to a Prisma query hitting Postgres, to a rate limiter checking Redis before an external API call goes out. Every route and feature here was built with the backend logic written and understood by me, with the frontend built collaboratively and explained line by line.

## Features

- **Auth** — signup/login with bcrypt-hashed passwords and JWT-based sessions
- **Workspaces** — multiple workspaces per user, with a switcher
- **Collections & Requests** — full CRUD, with cascading deletes (deleting a collection cleans up its requests and their history automatically)
- **Live request execution** — real HTTP calls made server-side, with status, timing, and response captured
- **Run history** — every execution is logged; click any past run to see exactly what it returned
- **Auth helper** — Bearer token support, auto-merged into request headers
- **Query params editor** — a key/value table kept in sync with the URL bar in both directions
- **Environment variables** — define `{{baseUrl}}`-style variables per workspace, swapped in server-side right before a request executes (via regex + recursive substitution across the URL, headers, and body)
- **Search** — find saved requests by name across a workspace
- **Monaco editor** — real syntax-highlighted, error-checked JSON editing for headers and bodies (the same editor that powers VS Code)
- **Rate limiting** — Redis-backed, per-user limit on request execution to prevent abuse
- **Dockerized** — the full stack (app, Postgres, Redis) runs locally via a single `docker compose up`

## Tech stack

**Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Monaco Editor
**Backend:** Next.js API routes, Prisma ORM, JWT auth, Zod validation
**Data:** PostgreSQL (Neon), Redis (Upstash) for rate limiting
**Infra:** Docker & Docker Compose (local dev), deployed on Vercel

## Architecture

```
Browser (React UI)
      │  HTTP
      ▼
Next.js app (API routes + Prisma Client)
      │                    │
      ▼                    ▼
  Postgres            Redis
 (all app data)   (rate-limit counters)
      
      │  fetch() on Send
      ▼
  External API being tested
```

Data model: `User → Workspace → Collection → Request → History`, with `Environment` also hanging off `Workspace`. Full cascade deletes are enforced at the database level via Prisma relations.

## Running locally

**Requirements:** Node 20+, Docker Desktop

```bash
git clone https://github.com/nipuna1902/postman-lite.git
cd postman-lite
```

Create a `.env` file:

```
DATABASE_URL="postgresql://postman:postman123@localhost:5433/postman_lite"
JWT_SECRET="your-secret-here"
```

Start everything (app + Postgres + Redis) with Docker:

```bash
docker compose up --build
```

Run migrations against the fresh database:

```bash
npx prisma migrate deploy
```

Visit `http://localhost:3000`.

Alternatively, for faster frontend iteration, run just the databases in Docker and the app locally:

```bash
docker compose up postgres redis -d
npm install
npm run dev
```

## What I'd build next

- Editable environment variables through a proper UI form (currently backend-complete, tested via API)
- A shared/team workspace model with invite-based access
- Request duplication and drag-and-drop reordering within collections
