# Contributing

1. Install with `npm install` (Node 22).
2. Start the app with `npm run dev`.
3. Before committing, run `npm run check`. It must pass: type check, ESLint with zero warnings, unit tests with 100% coverage, and the build.
4. For user-facing changes, also run `npm run test:e2e` (Playwright with axe at three widths).

## Conventions

- Business rules go in `src/domain` as pure functions with unit tests. Components stay presentational.
- Scheme facts must cite a source in `src/data/sources.ts`. Never invent an amount or deadline.
- Query elements in tests by role, label and text, and interact through `userEvent`.
- Keep every page accessible: one `h1`, ordered headings, labelled controls, visible focus and no colour-only meaning.
- Write small commits that each describe one change.
