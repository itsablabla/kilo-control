# Kilo Control

A single-user Next.js 15 control panel for [app.kilo.ai](https://app.kilo.ai).

Wraps the Kilo tRPC API so you can manage Agent Profiles, view Cloud Agent
sessions, talk to the Kilo LLM Gateway, and watch your credits — all from one
password-gated dashboard.

## Features

- **Dashboard** — credits remaining, default profile, active sessions, KiloClaw
  sandbox status, BYOK providers.
- **Profiles** — list, create, edit (name/description), set default, delete,
  and edit setup commands (with the 500-char-per-command validation the Kilo
  backend enforces).
- **Sessions** — live list of active Cloud Agent sessions plus KiloClaw sandbox
  details (provider, region, Fly machine, secret counts, etc.).
- **Chat** — direct access to the Kilo Gateway (`/api/gateway/v1/chat/completions`).
  Preferred models surfaced first; billed against your Kilo credits.
- **Models** — browse every model the Gateway exposes.
- **Credits** — balance, usage bar, Kilo Pass threshold, account info.

## Stack

- Next.js 15 (App Router, server actions)
- Tailwind CSS + minimal shadcn-style UI primitives
- Password-gated via signed cookie middleware
- All Kilo calls happen server-side — the JWT never reaches the client

## Env vars

See [`.env.example`](./.env.example). Required:

| Name | Purpose |
| --- | --- |
| `KILO_API_TOKEN` | Your Kilo JWT (from app.kilo.ai profile) |
| `APP_PASSWORD` | Password to gate access to the UI |

Optional:

| Name | Purpose |
| --- | --- |
| `APP_SESSION_SECRET` | HMAC secret for the session cookie (defaults to `APP_PASSWORD`) |
| `KILO_API_BASE` | Override the Kilo API base URL (default `https://api.kilo.ai`) |

## Local dev

```bash
npm install
cp .env.example .env.local
# edit .env.local — set KILO_API_TOKEN and APP_PASSWORD
npm run dev
```

Then open http://localhost:3000 and sign in with `APP_PASSWORD`.

## Deploy (Kilo Deploy)

1. Push this repo to GitHub.
2. In app.kilo.ai → Deploy, link the repo and add env vars `KILO_API_TOKEN`
   and `APP_PASSWORD` (mark both as secrets).
3. Deploy. Kilo Deploy auto-detects Next.js 15.

## Kilo API reference

All calls go through `lib/kilo.ts` which wraps Kilo's tRPC endpoints:

- `agentProfiles.list / .get / .create / .update / .delete / .setCommands / .setAsDefault`
- `activeSessions.list`
- `kiloclaw.getStatus`
- `models.list`
- `byok.list`
- `/api/user` (REST)
- `/api/gateway/v1/chat/completions` (OpenAI-compatible)
