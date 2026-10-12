# Staffora Candidate Portal (`candidate/`)

Frontend demonstration portal for candidates exploring roles and tracking applications.

## Quick start

```bash
npm install
npm run dev
```

Dev server: **http://localhost:5175**

```bash
npm run build
npm run preview
```

## Demo sign-in

- Email: `mia.chen@example.com`
- Password: any value (not verified)
- Profile ID: `cand-mia`

Authentication is simulated with `sessionStorage`. Register / forgot-password flows are UI-only and still sign into the shared Mia Chen demo profile.

## Routes

| Path | Purpose |
|------|---------|
| `/login` | Demo sign-in |
| `/register` | Simulated registration |
| `/forgot-password` | Simulated reset |
| `/dashboard` | Overview |
| `/jobs` | Browse published sample jobs |
| `/jobs/:id` | Job detail + apply modal |
| `/applications` | Application list |
| `/applications/:id` | Timeline + withdraw |
| `/saved-jobs` | Local bookmarks |
| `/profile` | Edit cand-mia profile |
| `/documents` | CV metadata (no file upload) |
| `/interviews` | Scheduled interviews |
| `/notifications` | In-app demo alerts |
| `/settings` | Local preferences |

## Architecture

- React + Vite + Tailwind CSS v4
- `AuthProvider` (`portal="candidate"`) + `DataProvider` + `ToastProvider`
- Demo fixtures in `src/mock/seed.js`

## Honest demo limits

- No real account creation, email delivery, or CV storage
- Applications and profile edits update local state only
- Cross-app IDs align with `employee/` and `admin/` demos
