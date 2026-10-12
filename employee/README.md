# Staffora Employer Portal (`employee/`)

Frontend demonstration portal for employers and workforce managers.

## Quick start

```bash
npm install
npm run dev
```

Dev server: **http://localhost:5174**

```bash
npm run build
npm run preview
```

## Demo sign-in

- Email: `priya.shah@northline.example`
- Password: any value (not verified)
- Company: Northline Logistics

Authentication is simulated with `sessionStorage`. Nothing is sent to a server.

## Routes

| Path | Purpose |
|------|---------|
| `/login` | Demo sign-in |
| `/dashboard` | Company overview |
| `/staffing-requests` | List / filter requests |
| `/staffing-requests/new` | Create request |
| `/staffing-requests/:id` | Request detail |
| `/staffing-requests/:id/edit` | Edit request |
| `/candidates` | Candidate review |
| `/candidates/:id` | Candidate detail + local notes |
| `/placements` | Placements list |
| `/placements/:id` | Placement detail |
| `/workforce` | Assigned workers |
| `/workforce/:id` | Worker detail |
| `/timesheets` | Timesheet list |
| `/timesheets/:id` | Approve / reject with reason |
| `/documents` | Company documents |
| `/invoices` | Invoices |
| `/invoices/:id` | Printable invoice detail |
| `/reports` | Charts (Recharts) |
| `/company` | Edit company profile |
| `/team` | Employer users |
| `/settings` | Local preferences |

## Architecture

- React + Vite + Tailwind CSS v4
- `AuthProvider` (`portal="employee"`) + `DataProvider` + `ToastProvider`
- Demo fixtures in `src/mock/seed.js` (canonical copy also in `../server/shared/fixtures`)
- All mutations update in-memory / session state only

## Honest demo limits

- No live authentication, payroll, payments, or document storage
- Timesheet approvals and invoice prints are local UX only
- Cross-app workflows share stable demo IDs with `candidate/` and `admin/`
