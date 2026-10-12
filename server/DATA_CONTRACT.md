# Shared Demo Data Contract

This folder documents the entity schemas and seeded identifiers used across the three frontend panels.

**Important:** The portals run as independent Vite apps on separate ports. They do **not** automatically share browser state. Each app ships with seeded fixtures that use the same IDs and relationships so workflows can be demonstrated consistently. Future synchronisation should go through replaceable API services.

## Applications & ports

| App | Folder | Dev port | Purpose |
|---|---|---|---|
| Public site | `client/` | `5177` | Marketing website |
| Employer portal | `employee/` | `5178` | Client company portal |
| Candidate portal | `candidate/` | `5179` | Job seeker portal |
| Admin dashboard | `admin/` | `5184` | Agency staff console |
| Future API | `server/` | — | Backend |
| Shared seed | `server/shared/fixtures/` | — | Canonical demo fixtures |

## Entity schemas

### Company
`id`, `name`, `contactName`, `email`, `phone`, `industry`, `website`, `billingAddress`, `workLocations[]`, `status` (`Active`|`Archived`), `createdAt`

Seed: `co-northline`, `co-harbor`

### User
`id`, `name`, `email`, `role`, `companyId?`, `status`

### Candidate
`id`, `fullName`, `email`, `phone`, `city`, `country`, `headline`, `bio`, `skills[]`, `experience[]`, `education[]`, `preferences{}`, `availability`, `status`, `visibility`

Seed: `cand-ava`, `cand-noah`, `cand-mia`, `cand-liam`

### Job
`id`, `title`, `companyId`, `staffingRequestId?`, `location`, `employmentType`, `category`, `skills[]`, `description`, `status` (`Draft`|`Published`|`Closed`), `salaryLabel?`, `isSample`

Seed published jobs: `job-warehouse`, `job-admin`, `job-hospitality`

### StaffingRequest
`id`, `companyId`, `title`, `role`, `department`, `headcount`, `employmentType`, `skills[]`, `qualifications`, `experience`, `location`, `startDate`, `duration`, `hours`, `payRange`, `description`, `additional`, `priority`, `status`, `recruiterId?`, `createdAt`, `updatedAt`

Statuses: `Draft`, `Submitted`, `Under Review`, `Sourcing Candidates`, `Shortlisting`, `Interviews`, `Filled`, `Cancelled`

### Application
`id`, `candidateId`, `jobId`, `status`, `coverLetter`, `availability`, `appliedAt`, `updatedAt`, `timeline[]`

Statuses: `Submitted`, `Under Review`, `Shortlisted`, `Interview`, `Offer`, `Hired`, `Rejected`, `Withdrawn`

### Interview
`id`, `candidateId`, `jobId`, `companyId`, `datetime`, `timezone`, `type`, `interviewer`, `locationOrLink`, `status`, `feedback`

### Placement
`id`, `candidateId`, `workerId?`, `companyId`, `staffingRequestId`, `jobId?`, `role`, `department`, `location`, `employmentType`, `startDate`, `endDate?`, `rate`, `status`, `recruiterId`, `contractRef`

### Worker
`id`, `placementId`, `candidateId`, `companyId`, `displayName`, `role`, `department`, `location`, `employmentType`, `pattern`, `status`, `startDate`, `endDate?`

### Timesheet
`id`, `workerId`, `companyId`, `weekEnding`, `regularHours`, `overtimeHours`, `breakHours`, `totalHours`, `status`, `submittedAt?`, `reviewedAt?`, `rejectionReason?`

Statuses: `Draft`, `Submitted`, `Approved`, `Rejected`, `Locked for Processing`

### ContractDocument
`id`, `title`, `category`, `companyId?`, `candidateId?`, `workerId?`, `placementId?`, `issuedAt`, `expiresAt?`, `status`

### PayrollPeriod / PayrollEntry
Period: `id`, `label`, `startDate`, `endDate`, `status`  
Entry: `id`, `periodId`, `workerId`, `companyId`, `timesheetIds[]`, `regularHours`, `overtimeHours`, `hourlyRate`, `gross`, `deductions`, `employerCost`, `net`, `status`, `notes`

### Invoice
`id`, `number`, `companyId`, `issueDate`, `dueDate`, `lineItems[{description,quantity,unitRate}]`, `subtotal`, `taxRate`, `tax`, `total`, `status`, `engagementLabel`

### Notification / AuditEvent
Notification: `id`, `audience`, `title`, `body`, `href`, `createdAt`, `read`  
AuditEvent: `id`, `timestamp`, `actor`, `action`, `entityType`, `entityId`, `summary`

## Required demo workflow (seeded)

1. Employer creates/views staffing request (`sr-warehouse` for Northline Logistics).
2. Admin assigns recruiter and updates status.
3. Candidate browses published jobs and applies (`job-warehouse`).
4. Admin advances application in recruitment pipeline.
5. Eligible candidate becomes placement + worker.
6. Worker timesheet submitted → approved.
7. Approved hours feed payroll preparation demo.
8. Admin issues invoice; employer views invoices/documents.

## Integration notes

Replace `src/services/*.js` in each app with real HTTP clients. Keep the same function signatures where practical (`listX`, `getX`, `createX`, `updateX`).
