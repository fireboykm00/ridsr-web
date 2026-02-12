# Phase 1 TODO (Stabilize Security, Correctness, and Complexity)

- [x] Create and maintain this checklist during execution
- [x] Enforce authorization in critical API routes (`/api/users/[id]`, `/api/users`, `/api/facilities`)
- [x] Standardize API auth helper behavior (explicit unauthorized/forbidden responses)
- [x] Fix hook-order violation in district report form page
- [x] Fix button loading prop mismatch by using one canonical prop
- [x] Remove unused duplicate user management form implementation
- [x] Replace hardcoded disease values in district report page with centralized disease constants
- [x] Run lint and tests; document what is fixed vs remaining

## Phase 1.1 TODO (Warning/Boilerplate Cleanup)

- [x] Remove unused imports/variables across dashboard pages and shared components
- [x] Fix `useEffect` dependency warning in patient dashboard page
- [x] Tighten facility search API auth path to enforce authenticated access
- [x] Re-run lint and verify zero errors/warnings
