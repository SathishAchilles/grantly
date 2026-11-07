# Architecture

Grantly is a client-side single-page app. There is no backend: data lives in typed modules and the student's progress is kept in `localStorage`.

## Layers

```
src/
  app/          Shell, routing, navigation and the active-person hook
  routes/       One lazy-loaded page per area, plus not-found and error pages
  components/   Reusable presentational components (cards, badges, panels)
  domain/       Pure, framework-free business logic and types
  data/         Scheme registry with sources, demo people, cases and mailbox
  store/        Zustand store: state, actions and persistence
  styles/       Design tokens and base styles
  test/         Test setup, fixtures and helpers
e2e/            Playwright end-to-end, accessibility and security tests
```

Dependencies point one way: `routes` → `components` → `store` → `domain` ← `data`. Domain code never imports React, and components never contain business rules.

## Domain modules

| Module | Responsibility |
|---|---|
| `domain/types.ts` | Shared types. Application, award, payment and renewal are separate tracks, and each status has a basis (provider-confirmed, evidence, college-confirmed, student-reported) |
| `domain/funding.ts` | Funding gap: costs minus family contribution minus **confirmed** support only |
| `domain/eligibility.ts` | Per-condition outcomes (meets, does not meet, more information needed, rule needs confirmation) and deadline conflicts between official sources |
| `domain/readiness.ts` | Per-programme document checks, including accepted alternatives, rejected substitutes and wrong academic years |
| `domain/caseworker.ts` | Turns a provider notice into one task using ordered keyword rules; caps and normalises input |
| `domain/email.ts` | Reads application emails into status, task, document and funding changes; flags likely scams |
| `domain/dates.ts` | India-time dates, display formatting and deadline ordering |

## State

`store/useGrantlyStore.ts` holds people, applications, tasks and processed emails. Every change goes through a named action (`setTaskStatus`, `confirmCaseworkerAction`, `applyEmailUpdates`, `reset`), and nothing changes until the user confirms. State is persisted with a version number so older saved state is discarded safely.

## Routing

`app/router.tsx` defines lazy routes, so each area is its own chunk. A root `errorElement` replaces any page that fails to load or render, and unknown paths show a not-found page. `vercel.json` rewrites every path to `index.html` for direct links.

## Data sources

Scheme rules, amounts and deadlines come from official pages checked on 7 Nov 2026, recorded in `data/sources.ts` and linked from the UI. Where a provider does not publish a value, the app says so instead of guessing.

## Quality gates

`npm run check` runs the type check, ESLint with zero warnings allowed, Vitest with a 100% coverage threshold, and the production build. `npm run test:e2e` runs Playwright with axe at 360, 768 and 1440 px, checks the security headers, and replays the full journey.

## Security

- Content Security Policy `default-src 'self'` with no inline scripts or styles, plus HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy and Permissions-Policy (`vercel.json`). The preview server mirrors them, so tests check what production serves.
- User text is length-capped and rendered as plain text only; no `innerHTML` or `eval`.
- No secrets, API keys or network calls.
