# Deployment (Hosting) Guide

This project is a **Next.js** app using **MongoDB (Mongoose)** and **NextAuth (Credentials provider)**.

## Recommended production settings

- Node.js: use **Node 20+**
- Build command: `npm ci && npm run build`
- Start command: `npm run start`
- Set `NODE_ENV=production`

## Environment variables (remote server)

Use `.env.example` as your template. On the server, set these variables in your hosting provider’s environment settings (do not commit `.env.local`).

### Required

- `MONGODB_URI`
  - Mongo connection string (MongoDB Atlas or self-hosted)
  - Used in `src/lib/services/db.ts`
- `NEXTAUTH_SECRET`
  - Used in `src/lib/auth.ts`
  - Generate: `openssl rand -base64 32`
- `NEXTAUTH_URL`
  - Public URL of your deployed app (must match your domain + protocol, e.g. `https://ridsr.example.com`)
  - Used in `src/lib/auth.ts` for server-side auth fetches

### Public (browser-exposed)

Anything with `NEXT_PUBLIC_` is embedded into the client bundle.

- `NEXT_PUBLIC_APP_URL`
  - Public URL (usually the same as `NEXTAUTH_URL`)
- `NEXT_PUBLIC_APP_NAME`
  - App name shown in UI
- `NEXT_PUBLIC_ENABLE_OFFLINE`
  - Feature flag (`true`/`false`)
- `NEXT_PUBLIC_ENABLE_QR_SCANNER`
  - Feature flag (`true`/`false`)

### Optional / integrations (only if you wired them in)

These are present in `.env.example` but are not currently referenced via `process.env` in `src/` (as of this repo state).

- `NIDA_API_URL`
- `NIDA_API_KEY`
- `SMS_PROVIDER_URL`
- `SMS_API_KEY`
- `MONGODB_DB` (database name; connection currently uses only `MONGODB_URI`)

### Hosting/platform-provided (do not set manually unless needed)

- `VERCEL_URL`
  - Used only as a fallback in `src/lib/auth.ts` when `NODE_ENV=production` and `NEXTAUTH_URL` is not set.
  - On non-Vercel hosts, **set `NEXTAUTH_URL`** explicitly.

## Skipping TypeScript + ESLint checks during deployment builds (optional)

If your host runs `next build` and you want to **skip TypeScript and ESLint build-time checks**, set:

- `SKIP_TYPECHECK=true`

This enables `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` in `next.config.ts`.

## Common host configs

### Generic VPS (systemd / PM2)

- Install deps: `npm ci`
- Build: `npm run build`
- Run: `npm run start` (set `PORT` if you don’t want `3000`)
- Reverse proxy (nginx/caddy) to `127.0.0.1:$PORT`

### Vercel

- Set the env vars above in the Vercel dashboard
- `NEXTAUTH_URL` is still recommended (avoids relying on `VERCEL_URL` fallback)

