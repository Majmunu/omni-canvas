# React 19 Upgrade Notes

## Current Baseline
- Date: 2026-03-09
- `react`: `18.3.1`
- `react-dom`: `18.3.1`
- `@types/react`: `18.3.28`
- `@types/react-dom`: `18.3.7`

## Upgrade Checklist
1. Confirm ecosystem compatibility:
   - UI libraries (e.g. component library, state management, router)
   - Form/validation libraries
   - Data fetching libraries
   - Testing tools (`@testing-library/*`, `vitest`/`jest`)
2. Create a dedicated upgrade branch.
3. Upgrade core packages:
   - `react`
   - `react-dom`
   - `@types/react`
   - `@types/react-dom`
4. Reinstall dependencies and regenerate lockfile.
5. Run quality gates:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`
6. Run full runtime validation:
   - Local manual smoke test
   - Key page flows
   - Browser compatibility check
7. If available, run E2E and integration tests.
8. Release in staged rollout if possible.

## Suggested Commands
```bash
npm install react@latest react-dom@latest
npm install -D @types/react@latest @types/react-dom@latest
npm run typecheck
npm run lint
npm run build
```

## Risk Focus
- Deprecated APIs and behavior changes in strict mode.
- Third-party packages that rely on older internals.
- SSR/hydration edge cases (if SSR is introduced later).

## Rollback Plan
1. Revert `package.json` and lockfile to React 18 commit.
2. Run `npm install`.
3. Re-run `typecheck`, `lint`, `build`.
