# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router (pages, layouts, CSS). i18n routing under `src/app/[locale]`.
- `src/components`: React components (PascalCase for feature components; `ui/` primitives in lowercase files).
- `src/ai`: AI helpers, prompts, and tests (`src/ai/tests`).
- `src/lib`, `src/services`, `src/hooks`, `src/contexts`: utilities, API clients, React hooks, and providers.
- `src/messages`: locale JSON for `next-intl`. Config in `i18n/request.ts`.
- `public`: static assets. `docs/`: internal references.

## Build, Test, and Development Commands
- `pnpm dev` or `pnpm dev:turbo`: run locally at `http://localhost:3333` (Turbopack optional).
- `pnpm build`: Next.js production build.
- `pnpm start`: start production server (after build).
- `pnpm lint`: ESLint (Next core-web-vitals rules).
- `pnpm test` | `pnpm test:watch` | `pnpm test:coverage`: run Jest. Example: `pnpm test src/ai/tests/deepseek-api.test.ts`.

## Coding Style & Naming Conventions
- Language: TypeScript (`strict` enabled). Imports via alias `@/` → `src/`.
- Components: PascalCase files (e.g., `AsteroidList.tsx`); UI primitives in `src/components/ui` use lowercase filenames.
- Hooks: `useThing.ts` in `src/hooks`.
- Linting: ESLint `next/core-web-vitals`. Tailwind via PostCSS. Keep JSX tidy and accessible.

## Testing Guidelines
- Framework: Jest with `ts-jest` and `node` environment.
- Test discovery: `**/src/ai/tests/**/*.test.ts`, `**/__tests__/**/*.ts`, or `*.test.ts`.
- Coverage: `pnpm test:coverage` collects from `src/**/*.ts` (excluding d.ts and tests).
- External API tests: `src/ai/tests/deepseek-api.test.ts` requires `DEEPSEEK_API_KEY`; otherwise tests are skipped.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `style:`, `docs:`). Keep scope brief and messages clear.
- PRs: include a concise description, screenshots for UI changes, steps to validate, and linked issues. Ensure `pnpm lint` and `pnpm test` pass.

## Security & Configuration Tips
- Environment: use `.env.local` for local dev (examples: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID/_SECRET`, `DATABASE_URL`, `DEEPSEEK_API_KEY`). Do not commit secrets; rotate if exposed.
- Data: be mindful of rate limits for external APIs; add caching on API routes where relevant.
- Accessibility/i18n: keep strings in `src/messages/*.json`; update `i18n/request.ts` when adding locales.
