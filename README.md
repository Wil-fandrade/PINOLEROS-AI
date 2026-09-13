# PINOLEROS AI

A TypeScript Cloudflare Worker for PINOLEROS AI.

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

## Project structure

```text
src/
  index.ts        Worker entry point and request routing
  routes/         Individual HTTP endpoint handlers
wrangler.jsonc    Cloudflare Worker configuration
```

Add a route in `src/routes/`, then register it in `src/index.ts`. Keep credentials in `.dev.vars` locally and configure production secrets with Wrangler; neither belongs in Git.
