# Grantly

Grantly helps students in India turn scholarship opportunities into usable education funding. It answers three questions: what can I pursue, what is missing, and who has to act next. It was built for The Outpost, a 6-hour solo frontend hackathon.

**Live:** https://grantly-taupe.vercel.app

## What it does

- **My funding plan:** the remaining gap counts only confirmed support. Pending applications are listed separately.
- **Opportunities:** each scheme is checked condition by condition (meets, does not meet, more information needed, rule needs confirmation), with the official source for every rule, amount and deadline. When official pages disagree, both dates are shown.
- **Readiness:** documents are checked against each programme's own rules, including accepted alternatives and rejected substitutes.
- **Applications:** a demo caseworker turns a provider notice into one task with an owner. It is a scripted demo using fixed rules, not AI.
- **College desk:** a shared queue where a coordinator acts on requests and the student sees the result.
- **Funding and renewal:** application, award, payment and renewal stay separate tracks, each showing whether the status was provider-confirmed, supported by evidence, confirmed by college staff, or student-reported.

Use "Viewing as" to switch between Meera Krishnan (renewing PM-USP CSSS), Arjun Kumar (a fresh B.Tech applicant) and Priya Nair (a college coordinator). "Reset demo data" in the footer restores the starting state.

Scheme facts come from official sources checked on 7 Nov 2026: PM-USP CSSS, HDFC Bank Parivartan ECSS, Foundation For Excellence and NMMSS. Where a provider does not publish a value, Grantly says so instead of guessing.

## Stack

- React 19, TypeScript (strict) and Vite
- React Router with lazy-loaded routes
- Zustand, persisted in `localStorage`
- Tailwind CSS, with tokens in `src/styles/tokens.css`
- No backend or login

TypeScript is pinned to 6.0.x and ESLint to 9.x because `typescript-eslint` and `eslint-plugin-jsx-a11y` do not yet support the newer majors.

## Setup

```bash
npm install
npm run dev
```

## Checks

```bash
npm run check      # type check, lint (zero warnings), unit tests with 100% coverage, build
npm run test:e2e   # Playwright with axe at 360, 768 and 1440 px, using the installed Chrome
```

The coverage report is written to `coverage/index.html`.
