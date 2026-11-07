# Grantly

Grantly helps students turn scholarship opportunities into usable education funding. It is being built for The Outpost, a 6-hour solo frontend hackathon.

This is the starter build: the shell, routes, design tokens and domain types are in place, and feature screens come next. No scholarship data is shown yet.

## Stack

- React 19, TypeScript and Vite
- React Router, with each area lazy-loaded
- Zustand, persisted in `localStorage`
- Tailwind CSS, with tokens in `src/styles/tokens.css`
- Motion and lucide-react
- No backend or login

TypeScript is pinned to 6.0.x and ESLint to 9.x because `typescript-eslint` and `eslint-plugin-jsx-a11y` do not yet support the newer majors.

## Setup

```bash
npm install
npm run dev
```

## Checks

```bash
npm run check
```

This runs the type check, lint with zero warnings allowed, and the production build. To view the production build, run `npm run preview`.
