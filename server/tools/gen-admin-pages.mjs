import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('admin/src/pages')
fs.mkdirSync(root, { recursive: true })
const w = (name, content) => {
  fs.writeFileSync(path.join(root, name), content)
  console.log('wrote', name)
}

w('DashboardPage.jsx', `import { Link } from 'react-router-dom'
import { Building2, ClipboardList, Users, Briefcase, Clock3, Receipt } from 'lucide-react'
import Badge, { statusTone } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function DashboardPage() {
  const { state } = useData()
  const openRequests = state.staffingRequests.filter((r) => !['Filled', 'Cancelled', 'Draft'].includes(r.status))
  const publishedJobs = state.jobs.filter((j) => j.status === 'Published')
  const pendingTs = state.timesheets.filter((t) => t.status === 'Submitted')
  const openInv = state.invoices.filter((i) => ['Issued', 'Overdue', 'Partially Paid'].includes(i.status))

  return (
    <div>
      <PageHeader title="Admin dashboard" description="Agency-wide demonstration overview across companies, recruitment, and operations." breadcrumbs={[{ label: 'Home' }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Companies" value={state.companies.length} icon={Building2} />
        <StatCard label="Candidates" value={state.candidates.length} icon={Users} />
        <StatCard label="Open requests" value={openRequests.length} icon={ClipboardList} />
        <StatCard label="Published jobs" value={publishedJobs.length} icon={Briefcase} />
        <StatCard label="Timesheets to review" value={pendingTs.length} icon={Clock3} />
        <StatCard label="Open invoices" value={openInv.length} icon={Receipt} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex justify-between"><h2 className="font-display text-lg font-bold uppercase">Recent requests</h2><Link to="/staffing-requests" className="text-xs font-bold uppercase text-accent">View all</Link></div>
          <div className="space-y-2">
            {state.staffingRequests.slice(0, 5).map((r) => (
              <Link key={r.id} to={\`/staffing-requests/\${r.id}\`} className="flex items-center justify-between rounded-md border border-line px-3 py-2 hover:bg-paper">
                <div><p className="font-medium">{r.title}</p><p className="text-xs text-muted">{formatDate(r.updatedAt)}</p></div>
                <Badge tone={statusTone(r.status)}>{r.status}</Badge>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex justify-between"><h2 className="font-display text-lg font-bold uppercase">Audit trail</h2><Link to="/audit-log" className="text-xs font-bold uppercase text-accent">Full log</Link></div>
          <div className="space-y-2">
            {state.auditEvents.slice(0, 5).map((e) => (
              <div key={e.id} className="rounded-md border border-line px-3 py-2 text-sm">
                <p className="font-medium">{e.summary}</p>
                <p className="text-xs text-muted">{e.actor} · {formatDate(e.timestamp)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
`)

w('CompaniesPage.jsx', `import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'

export default function CompaniesPage() {
  const { state } = useData()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.companies.filter((c) => !q || \`\${c.name} \${c.industry} \${c.contactName}\`.toLowerCase().includes(q.toLowerCase())), [state.companies, q])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title="Companies" description="Employer organisations in the shared demo dataset." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Companies' }]} />
      <input className="input-field mb-4 max-w-md" placeholder="Search companies" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable rows={slice} columns={[
        { key: 'name', label: 'Company', render: (c) => <Link className="font-medium hover:text-accent" to={\`/companies/\${c.id}\`}>{c.name}</Link> },
        { key: 'industry', label: 'Industry' },
        { key: 'contactName', label: 'Contact' },
        { key: 'status', label: 'Status', render: (c) => <Badge tone={statusTone(c.status)}>{c.status}</Badge> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
`)

w('CompanyDetailPage.jsx', `import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'

export default function CompanyDetailPage() {
  const { id } = useParams()
  const { state, updateCompany } = useData()
  const company = state.companies.find((c) => c.id === id)
  const { push } = useToast()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(() => company ? { ...company, workLocations: (company.workLocations || []).join(', ') } : null)
  if (!company || !form) return <EmptyState title="Company not found" actionLabel="Back" actionTo="/companies" />
  const requests = state.staffingRequests.filter((r) => r.companyId === id)
  const save = () => {
    updateCompany(id, { ...form, workLocations: form.workLocations.split(',').map((s) => s.trim()).filter(Boolean) })
    push({ title: 'Company updated locally', message: 'Demo state only.' })
    setEditing(false)
  }
  return (
    <div>
      <PageHeader title={company.name} description={company.industry} breadcrumbs={[{ label: 'Companies', to: '/companies' }, { label: company.name }]} actions={<Button variant="outline" onClick={() => setEditing((v) => !v)}>{editing ? 'Cancel' : 'Edit'}</Button>} />
      <div className="mb-4"><Badge tone={statusTone(company.status)}>{company.status}</Badge></div>
      {editing ? (
        <div className="card-panel grid gap-3 p-5 md:grid-cols-2">
          {['name','contactName','email','phone','website','industry','billingAddress','workLocations','status'].map((key) => (
            <Field key={key} id={key} label={key} className={key === 'billingAddress' || key === 'workLocations' ? 'md:col-span-2' : ''}>
              <input id={key} className="input-field" value={form[key] || ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </Field>
          ))}
          <div className="md:col-span-2"><Button onClick={save}>Save</Button></div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 space-y-2 text-sm">
            <p><strong>Contact:</strong> {company.contactName} · {company.email}</p>
            <p><strong>Phone:</strong> {company.phone}</p>
            <p><strong>Website:</strong> {company.website}</p>
            <p><strong>Billing:</strong> {company.billingAddress}</p>
            <p><strong>Locations:</strong> {(company.workLocations || []).join(', ')}</p>
          </Card>
          <Card className="space-y-2 text-sm">
            <p className="font-display text-sm font-bold uppercase">Staffing requests</p>
            {requests.map((r) => <Link key={r.id} className="block text-accent" to={\`/staffing-requests/\${r.id}\`}>{r.title}</Link>)}
          </Card>
        </div>
      )}
    </div>
  )
}
`)

w('CandidatesPage.jsx', `import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'

export default function CandidatesPage() {
  const { state } = useData()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.candidates.filter((c) => !q || \`\${c.fullName} \${c.skills.join(' ')} \${c.city}\`.toLowerCase().includes(q.toLowerCase())), [state.candidates, q])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title="Candidates" description="Talent pool for agency recruiters (demo)." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Candidates' }]} />
      <input className="input-field mb-4 max-w-md" placeholder="Search candidates" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable rows={slice} columns={[
        { key: 'fullName', label: 'Candidate', render: (c) => <Link className="font-medium hover:text-accent" to={\`/candidates/\${c.id}\`}>{c.fullName}</Link> },
        { key: 'city', label: 'Location' },
        { key: 'availability', label: 'Availability' },
        { key: 'status', label: 'Status', render: (c) => <Badge tone={statusTone(c.status)}>{c.status}</Badge> },
        { key: 'skills', label: 'Skills', render: (c) => c.skills.slice(0, 3).join(', ') },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
`)

w('CandidateDetailPage.jsx', `import { Link, useParams } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function CandidateDetailPage() {
  const { id } = useParams()
  const { state } = useData()
  const candidate = state.candidates.find((c) => c.id === id)
  if (!candidate) return <EmptyState title="Candidate not found" actionLabel="Back" actionTo="/candidates" />
  const apps = state.applications.filter((a) => a.candidateId === id)
  return (
    <div>
      <PageHeader title={candidate.fullName} description={candidate.headline} breadcrumbs={[{ label: 'Candidates', to: '/candidates' }, { label: candidate.fullName }]} />
      <div className="mb-4 flex flex-wrap gap-2"><Badge tone="gold">{candidate.status}</Badge><Badge tone="cream">{candidate.availability}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p className="text-muted">{candidate.bio}</p>
          <p><strong>Email:</strong> {candidate.email}</p>
          <p><strong>Phone:</strong> {candidate.phone}</p>
          <p><strong>Skills:</strong> {candidate.skills.join(', ')}</p>
          <div>{candidate.experience.map((ex) => (
            <div key={ex.id} className="mt-2 rounded-md border border-line p-3"><p className="font-medium">{ex.title} · {ex.employer}</p><p className="text-xs text-muted">{ex.startDate} – {ex.current ? 'Present' : ex.endDate}</p></div>
          ))}</div>
        </Card>
        <Card className="space-y-2 text-sm">
          <p className="font-display text-sm font-bold uppercase">Applications</p>
          {apps.length ? apps.map((a) => {
            const job = state.jobs.find((j) => j.id === a.jobId)
            return <Link key={a.id} className="block text-accent" to="/recruitment">{job?.title} · {a.status}</Link>
          }) : <p className="text-muted">None</p>}
          <p className="pt-2 text-xs text-muted">CV: {candidate.cvMeta?.fileName || '—'} · {formatDate(candidate.cvMeta?.updatedAt)}</p>
        </Card>
      </div>
    </div>
  )
}
`)

console.log('batch1 done')
