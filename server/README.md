# Staffora Server (`server/`)

Future backend / API application for the recruitment-staffing platform.

## Current contents

| Path | Purpose |
|------|---------|
| `DATA_CONTRACT.md` | Entity schemas and cross-app workflow documentation |

Canonical demo seed data lives in `shared/fixtures/seed.js`. One-time portal generators live in `tools/`.

## Status

No API server is implemented yet. Frontend portals keep local copies of seed data in each app’s `src/mock/seed.js` and talk to replaceable service layers until this folder hosts a real backend.

## Planned scope

- Authentication and authorisation
- REST/GraphQL APIs for companies, candidates, jobs, staffing requests, placements, timesheets, payroll prep, and invoices
- Secure CV / document storage
- Notifications and audit persistence
- Integrations for payroll, payments, and ATS sync
