# Repository Guidelines

## Project Structure & Module Organization
- Root contains `my-app/` (Next.js app) and `docs/` (PRD and design assets). Work inside `my-app/`.
- Key app folders: `app/` (App Router pages, `layout.tsx`, `page.tsx`), `components/` (UI; e.g., `components/preview/MobilePreview.tsx`), `lib/` (domain logic: `markdown/`, `svg/`, `product/`, `debug/`), `hooks/`, `types/`, and `public/`.
- Build artifacts live in `.next/` (ignore and don’t edit).

## Build, Test, and Development Commands
- From `my-app/`:
  - `npm run dev` — start local dev server (http://localhost:3000).
  - `npm run build` — production build via Next.js (Turbopack).
  - `npm run start` — run the built app.
  - `npm run lint` — run ESLint checks. Use `npm run lint -- --fix` to auto-fix.

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Path alias `@/*` maps to project root.
- Formatting: follow ESLint (`next/core-web-vitals`, `next/typescript`). Prefer 2‑space indentation; let ESLint fix quote/style differences.
- Naming:
  - React components: PascalCase files and exports (e.g., `MobilePreview.tsx`).
  - Hooks/utilities: kebab-case files, `useXxx` hook names (e.g., `hooks/use-debounced-value.ts`).
  - Types/interfaces: PascalCase in `types/`.

## Testing Guidelines
- No test framework configured yet. For new code, add colocated unit tests (e.g., `components/feature/__tests__/Feature.test.tsx`) and consider Playwright for e2e (`e2e/`).
- Keep tests deterministic and cover core rendering logic in `lib/markdown` and `lib/svg`.

## Commit & Pull Request Guidelines
- Commits: current history has no strict convention. Prefer Conventional Commits (e.g., `feat: add mobile preview overlay`, `fix: correct svg area mapping`).
- PRs: include a clear description, linked issues, before/after screenshots for UI changes, reproduction steps, and validation notes (`npm run lint`, build passing).

## Security & Configuration Tips
- Do not commit secrets; none are required for local dev. Keep large binaries out of git; place static assets in `public/`.
- Avoid editing `.next/` or generated files. Run commands from `my-app/`.

## Agent-Specific Instructions
- Use `rg` to search code quickly and respect this guide across the entire repo. When adding files, match existing structure and naming. Keep changes minimal and focused.

