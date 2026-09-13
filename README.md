# PINOLEROS AI

PINOLEROS.AI is a TypeScript Cloudflare Worker and the foundation for a creative platform that helps users ideate, generate, personalize, and print designs.

## Product roadmap

The project grows in small, deployable steps:

1. **Current — product foundation:** responsive dashboard, navigation, health check, and Cloudflare D1 persistence for design drafts.
2. **Accounts and ownership:** Cloudflare Access/authentication plus per-user design access.
3. **Creation studio:** prompt form, image uploads through R2, and a queued image-generation integration.
4. **Production workflow:** print-ready exports, orders, payments, and status notifications.

## Requirements

- Node.js 22 or later (the expected version is recorded in `.nvmrc`)
- A Cloudflare account for deployment

## Getting started

```sh
npm install
npm run dev
```

The local Worker is available at the URL printed by Wrangler.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the Worker locally. |
| `npm run typecheck` | Check TypeScript without emitting files. |
| `npm run check` | Run type checking and a deployment dry run. |
| `npm run deploy` | Deploy to Cloudflare. |

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Service landing response. |
| `GET` | `/health` | Liveness response: `{ "status": "ok" }`. |
| `GET` | `/api/dashboard` | Temporary recent-design and trend data for the dashboard. |
| `POST` | `/api/designs` | Saves a draft with `title`, optional `style`, and optional `prompt`. |

## Project structure

```text
src/
  index.ts        Worker entry point and request routing
  routes/         Individual HTTP endpoints and API handlers
  ui/             Server-rendered product interface
migrations/       Versioned Cloudflare D1 schema migrations
wrangler.jsonc    Cloudflare Worker configuration
```

Add a route in `src/routes/`, then register it in `src/index.ts`. The `DB` binding connects to the `pinoleros-ai-db` D1 database. Keep credentials in `.dev.vars` locally and configure production secrets with Wrangler; neither belongs in Git.
