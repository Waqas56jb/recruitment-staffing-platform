import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve('admin/src/pages')
const w = (name, content) => { fs.writeFileSync(path.join(root, name), content); console.log('wrote', name) }

w('StaffingRequestsPage.jsx', `import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function StaffingRequestsPage() {
  const { state } = useData()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.staffingRequests
    .filter((r) => !status || r.status === status)
    .filter((r) => !q || (r.title + r.role + r.location).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [state.staffingRequests, q, status])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title="Staffing requests" description="All employer briefs across demo companies." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Staffing requests' }]} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input className="input-field" placeholder="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        <select className="input-field" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          {['Draft','Submitted','Under Review','Sourcing Candidates','Shortlisting','Interviews','Filled','Cancelled'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <DataTable rows={slice} columns={[
        { key: 'title', label: 'Request', render: (r) => <Link className="font-medium hover:text-accent" to={\`/staffing-requests/\${r.id}\`}>{r.title}</Link> },
        { key: 'company', label: 'Company', render: (r) => state.companies.find((c) => c.id === r.companyId)?.name || '—' },
        { key: 'role', label: 'Role' },
        { key: 'headcount', label: 'HC' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
        { key: 'updatedAt', label: 'Updated', render: (r) => formatDate(r.updatedAt) },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
`)

w('StaffingRequestDetailPage.jsx', `import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

const STATUSES = ['Submitted','Under Review','Sourcing Candidates','Shortlisting','Interviews','Filled','Cancelled']

export default function StaffingRequestDetailPage() {
  const { id } = useParams()
  const { state, updateStaffingRequest } = useData()
  const request = state.staffingRequests.find((r) => r.id === id)
  const { push } = useToast()
  const [status, setStatus] = useState(request?.status || '')
  if (!request) return <EmptyState title="Request not found" actionLabel="Back" actionTo="/staffing-requests" />
  const company = state.companies.find((c) => c.id === request.companyId)
  return (
    <div>
      <PageHeader title={request.title} description={\`\${request.role} · \${company?.name || ''}\`} breadcrumbs={[{ label: 'Requests', to: '/staffing-requests' }, { label: request.title }]} />
      <div className="mb-4"><Badge tone={statusTone(request.status)}>{request.status}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-2 text-sm">
          <p><strong>Location:</strong> {request.location}</p>
          <p><strong>Headcount:</strong> {request.headcount}</p>
          <p><strong>Type:</strong> {request.employmentType}</p>
          <p><strong>Start:</strong> {formatDate(request.startDate)}</p>
          <p><strong>Skills:</strong> {(request.skills || []).join(', ')}</p>
          <p className="text-muted">{request.description}</p>
        </Card>
        <Card className="space-y-3">
          <Field id="status" label="Update status">
            <select id="status" className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Button onClick={() => { updateStaffingRequest(id, { status }); push({ title: 'Status updated locally', message: 'Employer was not notified remotely.' }) }}>Save status</Button>
          <Link className="block text-xs font-bold uppercase text-accent" to="/recruitment">Open recruitment board</Link>
        </Card>
      </div>
    </div>
  )
}
`)

w('JobsPage.jsx', `import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function JobsPage() {
  const { state } = useData()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.jobs
    .filter((j) => !status || j.status === status)
    .filter((j) => !q || (j.title + j.location).toLowerCase().includes(q.toLowerCase())), [state.jobs, q, status])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title="Jobs" description="Agency job listings (sample + draft)." actions={<Button to="/jobs/new">New job</Button>} breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Jobs' }]} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input className="input-field" placeholder="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        <select className="input-field" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          {['Draft','Published','Closed'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <DataTable rows={slice} columns={[
        { key: 'title', label: 'Job', render: (j) => <Link className="font-medium hover:text-accent" to={\`/jobs/\${j.id}\`}>{j.title}</Link> },
        { key: 'company', label: 'Company', render: (j) => state.companies.find((c) => c.id === j.companyId)?.name || '—' },
        { key: 'location', label: 'Location' },
        { key: 'postedAt', label: 'Posted', render: (j) => formatDate(j.postedAt) },
        { key: 'status', label: 'Status', render: (j) => <Badge tone={statusTone(j.status)}>{j.status}</Badge> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
`)

w('JobFormPage.jsx', `import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { required } from '../utils/validation'

const empty = { title: '', companyId: 'co-northline', location: '', employmentType: 'Temporary', category: 'Logistics', skills: '', experienceLevel: 'Entry', salaryLabel: '', description: '', responsibilities: '', requirements: '', status: 'Draft' }

export default function JobFormPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const { state, createJob, updateJob } = useData()
  const existing = useMemo(() => state.jobs.find((j) => j.id === id), [state.jobs, id])
  const [form, setForm] = useState(() => existing ? { ...existing, skills: (existing.skills || []).join(', '), responsibilities: (existing.responsibilities || []).join('\\n'), requirements: (existing.requirements || []).join('\\n') } : empty)
  const [errors, setErrors] = useState({})
  const { push } = useToast()
  const navigate = useNavigate()
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const save = (status) => {
    const next = { title: required(form.title), companyId: required(form.companyId), location: required(form.location) }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    const payload = {
      ...form, status,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      responsibilities: form.responsibilities.split('\\n').map((s) => s.trim()).filter(Boolean),
      requirements: form.requirements.split('\\n').map((s) => s.trim()).filter(Boolean),
      isSample: true,
    }
    if (isNew || !existing) {
      const item = createJob(payload)
      push({ title: 'Job created locally', message: 'Not published to a live board.' })
      navigate(\`/jobs/\${item.id}\`)
    } else {
      updateJob(existing.id, payload)
      push({ title: 'Job updated locally', message: 'Demo state only.' })
      navigate(\`/jobs/\${existing.id}\`)
    }
  }
  return (
    <div>
      <PageHeader title={isNew ? 'New job' : 'Edit job'} breadcrumbs={[{ label: 'Jobs', to: '/jobs' }, { label: isNew ? 'New' : 'Edit' }]} />
      <form className="card-panel grid gap-4 p-5 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save(form.status) }}>
        <Field id="title" label="Title" required error={errors.title}><input id="title" className="input-field" value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field id="companyId" label="Company" required error={errors.companyId}>
          <select id="companyId" className="input-field" value={form.companyId} onChange={(e) => set('companyId', e.target.value)}>
            {state.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field id="location" label="Location" required error={errors.location}><input id="location" className="input-field" value={form.location} onChange={(e) => set('location', e.target.value)} /></Field>
        <Field id="employmentType" label="Employment type"><select id="employmentType" className="input-field" value={form.employmentType} onChange={(e) => set('employmentType', e.target.value)}><option>Temporary</option><option>Permanent</option><option>Contract</option></select></Field>
        <Field id="category" label="Category"><input id="category" className="input-field" value={form.category} onChange={(e) => set('category', e.target.value)} /></Field>
        <Field id="salaryLabel" label="Salary label"><input id="salaryLabel" className="input-field" value={form.salaryLabel} onChange={(e) => set('salaryLabel', e.target.value)} /></Field>
        <Field id="skills" label="Skills (comma separated)" className="md:col-span-2"><input id="skills" className="input-field" value={form.skills} onChange={(e) => set('skills', e.target.value)} /></Field>
        <Field id="description" label="Description" className="md:col-span-2"><textarea id="description" className="input-field" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
        <Field id="responsibilities" label="Responsibilities (one per line)" className="md:col-span-2"><textarea id="responsibilities" className="input-field" rows={3} value={form.responsibilities} onChange={(e) => set('responsibilities', e.target.value)} /></Field>
        <Field id="requirements" label="Requirements (one per line)" className="md:col-span-2"><textarea id="requirements" className="input-field" rows={3} value={form.requirements} onChange={(e) => set('requirements', e.target.value)} /></Field>
        <div className="md:col-span-2 flex gap-2">
          <Button type="button" variant="outline" onClick={() => save('Draft')}>Save draft</Button>
          <Button type="button" onClick={() => save('Published')}>Publish</Button>
        </div>
      </form>
    </div>
  )
}
`)

w('JobDetailPage.jsx', `import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function JobDetailPage() {
  const { id } = useParams()
  const { state, updateJob } = useData()
  const job = state.jobs.find((j) => j.id === id)
  if (!job) return <EmptyState title="Job not found" actionLabel="Back" actionTo="/jobs" />
  const company = state.companies.find((c) => c.id === job.companyId)
  const apps = state.applications.filter((a) => a.jobId === id)
  return (
    <div>
      <PageHeader title={job.title} description={\`\${job.location} · \${company?.name || ''}\`} breadcrumbs={[{ label: 'Jobs', to: '/jobs' }, { label: job.title }]} actions={<Button to={\`/jobs/\${job.id}/edit\`} variant="outline">Edit</Button>} />
      <div className="mb-4 flex flex-wrap gap-2"><Badge tone={statusTone(job.status)}>{job.status}</Badge>{job.isSample ? <Badge tone="gold">Sample</Badge> : null}</div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p>{job.description}</p>
          <p><strong>Posted:</strong> {formatDate(job.postedAt)}</p>
          <p><strong>Skills:</strong> {(job.skills || []).join(', ')}</p>
          {job.status === 'Draft' ? <Button onClick={() => updateJob(job.id, { status: 'Published' })}>Publish locally</Button> : null}
        </Card>
        <Card className="space-y-2 text-sm">
          <p className="font-display text-sm font-bold uppercase">Applications ({apps.length})</p>
          {apps.map((a) => {
            const cand = state.candidates.find((c) => c.id === a.candidateId)
            return <Link key={a.id} className="block text-accent" to={\`/candidates/\${a.candidateId}\`}>{cand?.fullName} · {a.status}</Link>
          })}
          <Link className="block text-xs font-bold uppercase text-accent pt-2" to="/recruitment">Recruitment board</Link>
        </Card>
      </div>
    </div>
  )
}
`)

console.log('batch2 done')
