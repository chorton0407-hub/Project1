# Project1 – Next.js + NextAuth + Prisma + Tailwind + Gemini Chat

This app lets users register/login and chat with Google Gemini (via `@google/generative-ai`).

## What’s inside

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- NextAuth (Credentials) with Prisma adapter
- Prisma ORM (SQLite for local dev; Postgres recommended for production)
- Streaming chat responses (Server-Sent Events)

## Quick start (local)

1) Install deps

```bash
npm install
```

2) Copy env template and fill in values

```bash
cp .env.example .env.local
# Edit .env.local and set:
# NEXTAUTH_SECRET=(generate one: `openssl rand -base64 32`)
# DATABASE_URL=file:./dev.db            # for local dev with SQLite
# GEMINI_API_KEY=your-gemini-api-key    # https://aistudio.google.com/app/apikey
```

3) Generate Prisma client and create the local DB schema

```bash
npx prisma generate
npx prisma db push
```

4) Run the app

```bash
npm run dev
```

Open http://localhost:3000.

## Deployment (Vercel)

Production requires a hosted database (SQLite files are ephemeral in serverless). We recommend Postgres via Neon or Supabase.

1) Push to GitHub (already done if you see this repo).

2) Create a Postgres database (Neon free tier works great)
- Create a new Neon project: https://neon.tech/
- Copy the connection string and set it as `DATABASE_URL` (it should start with `postgresql://...`)

3) Switch Prisma to Postgres for production (optional if you already set `DATABASE_URL` to Postgres)

`prisma/schema.prisma` already reads `DATABASE_URL` from env. If you point it to Postgres in production, Prisma will use that. If you prefer, you can also set:

```
datasource db {
	provider = "postgresql"
	url      = env("DATABASE_URL")
}
```

4) Run migrations against your production DB (locally, pointing to the production `DATABASE_URL`)

```bash
# Temporarily export your production DATABASE_URL, then:
npx prisma migrate deploy
```

5) Deploy on Vercel
- Import your GitHub repo in https://vercel.com/new
- Framework preset: Next.js
- Build command: `next build` (default)
- Output directory: `.next` (default)
- Set Environment Variables (Project Settings → Environment Variables):
	- `NEXTAUTH_URL` = https://your-vercel-domain.vercel.app
	- `NEXTAUTH_SECRET` = same value as local but treat as secret
	- `DATABASE_URL` = your Postgres connection string
	- `GEMINI_API_KEY` = your Gemini API key

Trigger a deploy. Vercel will build the project and host it.

## Notes

- Credentials auth stores users/sessions via Prisma. Ensure your production DB is reachable and migrated before first login.
- Tailwind is wired via `postcss.config.mjs` and `tailwind.config.ts`; global styles are in `styles/globals.css`.
- Gemini key is read at request time; missing keys won’t break the build, but calls to the chat API will fail without it.

## Useful scripts

```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # start production server (after build)
npx prisma studio  # view DB locally (SQLite) or when pointed to remote
```

