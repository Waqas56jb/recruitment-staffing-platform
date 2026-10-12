# recruitment-staffing-platform

Premium international recruitment and staffing agency platform featuring a high-end React.js public website plus three Staffora demonstration portals (employer, candidate, and admin).

## Brand

Temporary public brand name: **Staffora** (configurable in `client/src/config/site.js`).

## Repository structure

```text
recruitment-staffing-platform/
├── client/       # Public marketing website
├── employee/     # Employer portal
├── candidate/    # Candidate portal
├── admin/        # Agency admin console
└── server/       # Future API, shared data, and generators
    ├── shared/   # Auth accounts and demo fixtures
    └── tools/    # One-time page generators
```


## Ports

| App | Folder | Dev port |
|-----|--------|----------|
| Public website | `client/` | http://localhost:5177 |
| Employer portal | `employee/` | http://localhost:5178 |
| Candidate portal | `candidate/` | http://localhost:5179 |
| Admin console | `admin/` | http://localhost:5184 |

> Ports were shifted because 5173–5176 are often used by other local projects.

## Public website (`client/`)

```bash
cd client
npm install
npm run dev
```

### Routes

- `/` Homepage
- `/employers` Employer landing + staffing request form
- `/candidates` Candidate landing + interest form
- `/jobs` Job search / filters
- `/jobs/:id` Job detail
- `/services` Service details
- `/industries` Industry showcase
- `/about` About the agency
- `/contact` Contact form
- `/privacy` Draft privacy policy
- `/cookies` Draft cookie policy
- `/terms` Draft terms
- `*` 404 page

## Portals (frontend demos)

Each portal is a separate Vite app with shared Staffora design tokens (ink / cream / accent / gold, Barlow Condensed), local `AuthContext` + `DataContext`, and honest demo messaging (no live backend).

```bash
cd employee   # or candidate / admin
npm install
npm run dev
npm run build
```

See each app README for demo credentials and route maps:

- [`employee/README.md`](employee/README.md) — employer portal
- [`candidate/README.md`](candidate/README.md) — candidate portal (`cand-mia`)
- [`admin/README.md`](admin/README.md) — admin console

Demo users:

| Portal | Email | Notes |
|--------|-------|-------|
| Employer | `priya.shah@northline.example` | Northline Logistics |
| Candidate | `mia.chen@example.com` | Profile `cand-mia` |
| Admin | `sophie@staffora.example` | Recruiter |

Any password works; credentials are not verified against a server.

## Design direction

- Display type: **Barlow Condensed**
- Body type: **Inter**
- Near-black ink (`#0b0b0c`) and warm cream surfaces (`#ebe9e3`)
- Bold accent red (`#c8102e`) and gold highlights (`#c9a14a`)

## Backend integrations still required

- Enquiry / form submission APIs
- CV storage and secure delivery
- Live vacancy CMS or ATS sync
- Authentication for portals
- Payroll, compliance, and payment provider integrations where applicable
- Real business contact details, legal pages, and analytics consent tooling
