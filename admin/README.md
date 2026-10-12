# Staffora Admin Console (`admin/`)

Internal agency administration frontend for demonstration workflows across companies, recruitment, workforce, and billing.

## Quick start

```bash
npm install
npm run dev
```

Dev server: **http://localhost:5176**

```bash
npm run build
npm run preview
```

## Demo sign-in

- Email: `sophie@staffora.example`
- Password: any value (not verified)
- Role: Recruiter

Authentication is simulated with `sessionStorage`.

## Routes

| Path | Purpose |
|------|---------|
| `/login` | Demo sign-in |
| `/dashboard` | Agency overview |
| `/companies`, `/companies/:id` | Client organisations |
| `/candidates`, `/candidates/:id` | Talent pool |
| `/staffing-requests`, `/staffing-requests/:id` | Employer briefs |
| `/jobs`, `/jobs/new`, `/jobs/:id`, `/jobs/:id/edit` | Vacancy management |
| `/recruitment` | Application kanban |
| `/interviews` | Schedule + feedback |
| `/placements`, `/placements/:id` | Assignments |
| `/workforce`, `/workforce/:id` | Workers |
| `/timesheets`, `/timesheets/:id` | Approve / reject |
| `/documents` | Document register |
| `/payroll`, `/payroll/:id` | Demo payroll periods |
| `/invoices`, `/invoices/new`, `/invoices/:id` | Billing |
| `/reports` | Recharts analytics |
| `/notifications` | Cross-audience alerts |
| `/users` | Agency users |
| `/roles` | Role matrix |
| `/audit-log` | Local audit events |
| `/settings` | Console preferences |

## Architecture

- React + Vite + Tailwind CSS v4
- `AuthProvider` (`portal="admin"`) + `DataProvider` + `ToastProvider`
- Demo fixtures in `src/mock/seed.js` (aligned with employer/candidate portals)

## Honest demo limits

- No live ATS, payroll provider, payments, or identity provisioning
- Mutations update in-memory / session state only
- Payroll and invoice figures are illustrative estimates
