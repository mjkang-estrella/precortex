# Precortex

Precortex is a small TypeScript task and project planner with:

- a browser UI bundled with `esbuild`
- Tailwind-based styling
- Auth0 authentication
- Convex for backend data, auth-aware queries, and mutations
- optional voice note transcription through AssemblyAI

The app centers around inbox, today, upcoming, and project views, plus a side assistant panel for planning and project setup.

## Stack

- TypeScript
- Vanilla browser app architecture
- Convex
- Auth0 SPA SDK
- Tailwind CSS
- esbuild
- Node test runner

## Requirements

- Node.js 18+
- npm
- a Convex deployment
- an Auth0 SPA application
- AssemblyAI API key if you want voice transcription enabled

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill in the public app config:

```bash
CONVEX_URL=https://your-deployment.convex.cloud
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_AUDIENCE=your_auth0_audience
```

3. If you want voice transcription, also add:

```bash
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
```

Notes:

- `scripts/load-env.mjs` loads `.env` and `.env.local`.
- `scripts/generate-config.mjs` writes the public browser config to `dist/config.js`.
- `AUTH0_DOMAIN` and `AUTH0_CLIENT_ID` are also used by Convex auth config.

## Local Development

Run the frontend dev server:

```bash
npm run dev
```

This starts:

- Tailwind in watch mode
- esbuild in watch mode
- a small static HTTP server at `http://127.0.0.1:4173` by default

Run Convex in a separate terminal:

```bash
npm run convex:dev
```

## Scripts

- `npm run dev` starts the local frontend server and asset watchers
- `npm run build` creates a production build in `build/`
- `npm run check` runs TypeScript type checking
- `npm run convex:dev` runs Convex locally against your configured deployment
- `npm run test:backend` runs backend/domain tests with Node's built-in test runner

## Production Build

Create the production bundle:

```bash
npm run build
```

Output:

- `dist/` contains generated frontend assets and `config.js`
- `build/` contains the deployable output used by Vercel

`vercel.json` is configured with:

- `buildCommand`: `npm run build`
- `outputDirectory`: `build`

## Project Structure

```text
src/       frontend app state, views, auth client, and browser entrypoint
convex/    schema, queries, mutations, auth config, and backend helpers
styles/    Tailwind input and app styles
scripts/   local build, env loading, and config generation
tests/     backend/domain tests
```

Key entry points:

- `src/main.ts` wires the UI, auth, subscriptions, and interactions
- `convex/schema.ts` defines the `projects` and `tasks` tables
- `convex/projects.ts` contains project queries and mutations
- `convex/tasks.ts` contains task queries and mutations
- `convex/transcription.ts` handles authenticated voice note transcription

## Data Model

Core tables:

- `projects`: name, summary, next step, optional deadline, optional planning metadata
- `tasks`: title, description, status, due date, optional project link, priority, tags, subtasks, ordering fields

Tasks are grouped into UI buckets like inbox, today, upcoming, and per-project lists.

## Testing

Run:

```bash
npm run test:backend
```

Current tests cover backend/domain behavior such as:

- trimmed required text validation
- ISO date normalization
- task list classification
- reorder target validation

## Notes

- There is no framework runtime here; the frontend is a direct browser app.
- `dist/` and `build/` are generated and ignored by Git.
- `.env` and `.env.local` are ignored by Git.

## Public demo

Open `/?demo=1` without logging in. The demo uses the application's Inbox, Today,
Upcoming, project views, task cards, and task details. Its fictional workshop
and tasks are created afresh in memory. Every change, including subtasks,
completion, priority, date, and project assignment, stays in that page. Reloading
or leaving discards it; Reset restores the starting state. Undo retains up to 50
changes in this page. Nothing is imported into an account on login.

The demo branch never initializes Auth0 or Convex and never calls live AI or
voice transcription. Its explicitly prewritten planning example explains its
reasoning before the visitor applies it. Account AI planning, new-project setup,
and voice transcription require their existing configured backend providers.
No new backend functions, public AI endpoints, or environment variables are needed.

The landing page also renders without local auth configuration. To run the demo:

```bash
PORT=4187 npm run dev
npm run check
npm run test:backend
npm run test:demo:browser
```

The browser check uses Playwright CLI through `npx` in an isolated browser
profile. It checks triage, priority/date edits, undo, subtasks, reset, mobile
layout, keyboard focus, unchanged sample account-storage sentinels, and zero
Auth0/Convex/AI requests or WebSockets in the demo. It does not authenticate a
real account. Set `DEMO_BASE_URL` to test another deployment.

Production follows the existing Vercel Git integration from `main`, with
`npm run build` and the `build/` output directory. Keep the production public
Auth0 and Convex environment configuration unchanged.
