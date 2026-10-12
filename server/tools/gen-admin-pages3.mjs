import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve('admin/src/pages')
const w = (name, content) => { fs.writeFileSync(path.join(root, name), content); console.log('wrote', name) }

w('RecruitmentPage.jsx', `import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'

const COLUMNS = ['Submitted', 'Under Review', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected']

export default function RecruitmentPage() {
  const { state, updateApplication, createInterview, createPlacement } = useData()
  const { push } = useToast()
  const [jobFilter, setJobFilter] = useState('')
  const apps = useMemo(() => state.applications.filter((a) => !jobFilter || a.jobId === jobFilter), [state.applications, jobFilter])

  const move = (app, status) => {
    updateApplication(app.id, { status, note: 'Moved on recruitment board (demo)' })
    push({ title: 'Application updated locally', message: \`Status → \${status}\` })
  }

  const schedule = (app) => {
    createInterview({
      candidateId: app.candidateId,
      jobId: app.jobId,
      companyId: state.jobs.find((j) => j.id === app.jobId)?.companyId || 'co-northline',
      datetime: new Date(Date.now() + 86400000 * 3).toISOString(),
      timezone: 'Europe/London',
      type: 'Video',
      interviewer: 'Sophie Lane',
      locationOrLink: 'Meeting link placeholder (demo)',
    })
    updateApplication(app.id, { status: 'Interview', note: 'Interview scheduled (demo)' })
    push({ title: 'Interview scheduled locally', message: 'Candidate was not emailed.' })
  }

  const place = (app) => {
    const job = state.jobs.find((j) => j.id === app.jobId)
    createPlacement({
      candidateId: app.candidateId,
      companyId: job?.companyId || 'co-northline',
      staffingRequestId: job?.staffingRequestId || null,
      jobId: app.jobId,
      role: job?.title || 'Role',
      department: job?.category || 'General',
      location: job?.location || 'TBC',
      employmentType: job?.employmentType || 'Temporary',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: null,
      rate: 13,
      rateUnit: 'hour',
    })
    updateApplication(app.id, { status: 'Hired', note: 'Placement created (demo)' })
    push({ title: 'Placement created locally', message: 'Worker record added in demo state.' })
  }

  return (
    <div>
      <PageHeader title="Recruitment board" description="Kanban of applications. Drag is simulated via action buttons." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Recruitment' }]} />
      <select className="input-field mb-4 max-w-sm" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
        <option value="">All jobs</option>
        {state.jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
      </select>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const items = apps.filter((a) => a.status === col)
          return (
            <div key={col} className="w-72 shrink-0 rounded-xl border border-line bg-cream/40 p-3">
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-wide">{col} ({items.length})</p>
              <div className="space-y-3">
                {items.map((app) => {
                  const cand = state.candidates.find((c) => c.id === app.candidateId)
                  const job = state.jobs.find((j) => j.id === app.jobId)
                  return (
                    <Card key={app.id} className="space-y-2 p-3 text-sm">
                      <p className="font-medium">{cand?.fullName}</p>
                      <p className="text-xs text-muted">{job?.title}</p>
                      <Badge tone={statusTone(app.status)}>{app.status}</Badge>
                      <div className="flex flex-wrap gap-1">
                        {COLUMNS.filter((c) => c !== app.status).slice(0, 3).map((c) => (
                          <Button key={c} size="sm" variant="outline" onClick={() => move(app, c)}>{c}</Button>
                        ))}
                        {app.status === 'Shortlisted' || app.status === 'Under Review' ? <Button size="sm" onClick={() => schedule(app)}>Schedule</Button> : null}
                        {['Interview', 'Offer', 'Shortlisted'].includes(app.status) ? <Button size="sm" onClick={() => place(app)}>Place</Button> : null}
                      </div>
                      <Link className="text-xs text-accent" to={\`/candidates/\${app.candidateId}\`}>Profile</Link>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
`)

w('InterviewsPage.jsx', `import { useState } from 'react'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { formatDateTime } from '../utils/format'
import { required } from '../utils/validation'

export default function InterviewsPage() {
  const { state, createInterview, updateInterview } = useData()
  const { push } = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ candidateId: 'cand-mia', jobId: 'job-admin', companyId: 'co-northline', datetime: '', type: 'Video', interviewer: 'Sophie Lane', locationOrLink: '' })
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = () => {
    const next = { datetime: required(form.datetime), interviewer: required(form.interviewer) }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    createInterview({ ...form, status: 'Scheduled', feedback: '' })
    push({ title: 'Interview created locally', message: 'No calendar invite was sent.' })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader title="Interviews" description="Schedule and capture feedback in demo state." actions={<Button onClick={() => setOpen(true)}>Schedule interview</Button>} breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Interviews' }]} />
      <div className="grid gap-4 md:grid-cols-2">
        {state.interviews.map((item) => {
          const cand = state.candidates.find((c) => c.id === item.candidateId)
          const job = state.jobs.find((j) => j.id === item.jobId)
          return (
            <Card key={item.id} className="space-y-2 text-sm">
              <div className="flex justify-between gap-2"><h2 className="font-display text-lg font-bold uppercase">{cand?.fullName}</h2><Badge tone={statusTone(item.status)}>{item.status}</Badge></div>
              <p>{job?.title}</p>
              <p>{formatDateTime(item.datetime)} · {item.type}</p>
              <p className="text-muted">{item.interviewer} · {item.locationOrLink}</p>
              <Field id={\`fb-\${item.id}\`} label="Feedback">
                <textarea id={\`fb-\${item.id}\`} className="input-field" rows={2} defaultValue={item.feedback} onBlur={(e) => updateInterview(item.id, { feedback: e.target.value })} />
              </Field>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => updateInterview(item.id, { status: 'Completed' })}>Mark completed</Button>
                <Button size="sm" variant="danger" onClick={() => updateInterview(item.id, { status: 'Cancelled' })}>Cancel</Button>
              </div>
            </Card>
          )
        })}
      </div>
      <Modal open={open} title="Schedule interview" onClose={() => setOpen(false)} footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="space-y-3">
          <Field id="candidateId" label="Candidate"><select id="candidateId" className="input-field" value={form.candidateId} onChange={(e) => set('candidateId', e.target.value)}>{state.candidates.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}</select></Field>
          <Field id="jobId" label="Job"><select id="jobId" className="input-field" value={form.jobId} onChange={(e) => set('jobId', e.target.value)}>{state.jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</select></Field>
          <Field id="datetime" label="Date & time" required error={errors.datetime}><input id="datetime" type="datetime-local" className="input-field" value={form.datetime} onChange={(e) => set('datetime', e.target.value)} /></Field>
          <Field id="interviewer" label="Interviewer" required error={errors.interviewer}><input id="interviewer" className="input-field" value={form.interviewer} onChange={(e) => set('interviewer', e.target.value)} /></Field>
          <Field id="locationOrLink" label="Location / link"><input id="locationOrLink" className="input-field" value={form.locationOrLink} onChange={(e) => set('locationOrLink', e.target.value)} /></Field>
        </div>
      </Modal>
    </div>
  )
}
`)

w('PlacementsPage.jsx', `import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDate, formatMoney } from '../utils/format'

export default function PlacementsPage() {
  const { state } = useData()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.placements.filter((p) => {
    const cand = state.candidates.find((c) => c.id === p.candidateId)
    return !q || \`\${p.role} \${cand?.fullName || ''} \${p.location}\`.toLowerCase().includes(q.toLowerCase())
  }), [state, q])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title="Placements" description="Confirmed assignments across clients." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Placements' }]} />
      <input className="input-field mb-4 max-w-md" placeholder="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable rows={slice} columns={[
        { key: 'role', label: 'Role', render: (p) => <Link className="font-medium hover:text-accent" to={\`/placements/\${p.id}\`}>{p.role}</Link> },
        { key: 'candidate', label: 'Candidate', render: (p) => state.candidates.find((c) => c.id === p.candidateId)?.fullName },
        { key: 'company', label: 'Company', render: (p) => state.companies.find((c) => c.id === p.companyId)?.name },
        { key: 'startDate', label: 'Start', render: (p) => formatDate(p.startDate) },
        { key: 'rate', label: 'Rate', render: (p) => formatMoney(p.rate) },
        { key: 'status', label: 'Status', render: (p) => <Badge tone={statusTone(p.status)}>{p.status}</Badge> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
`)

w('PlacementDetailPage.jsx', `import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDate, formatMoney } from '../utils/format'

export default function PlacementDetailPage() {
  const { id } = useParams()
  const { state } = useData()
  const placement = state.placements.find((p) => p.id === id)
  if (!placement) return <EmptyState title="Placement not found" actionLabel="Back" actionTo="/placements" />
  const cand = state.candidates.find((c) => c.id === placement.candidateId)
  const company = state.companies.find((c) => c.id === placement.companyId)
  return (
    <div>
      <PageHeader title={placement.role} description={\`\${cand?.fullName} @ \${company?.name}\`} breadcrumbs={[{ label: 'Placements', to: '/placements' }, { label: placement.role }]} />
      <div className="mb-4"><Badge tone={statusTone(placement.status)}>{placement.status}</Badge> <Badge tone="muted">{placement.contractRef}</Badge></div>
      <Card className="space-y-2 text-sm">
        <p><strong>Location:</strong> {placement.location}</p>
        <p><strong>Dates:</strong> {formatDate(placement.startDate)} – {formatDate(placement.endDate)}</p>
        <p><strong>Rate:</strong> {formatMoney(placement.rate)} / {placement.rateUnit}</p>
        <p><strong>Worker:</strong> <Link className="text-accent" to={\`/workforce/\${placement.workerId}\`}>{placement.workerId}</Link></p>
        <p><strong>Candidate:</strong> <Link className="text-accent" to={\`/candidates/\${placement.candidateId}\`}>{cand?.fullName}</Link></p>
      </Card>
    </div>
  )
}
`)

w('WorkforcePage.jsx', `import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'

export default function WorkforcePage() {
  const { state } = useData()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.workers.filter((w) => !q || \`\${w.displayName} \${w.role} \${w.location}\`.toLowerCase().includes(q.toLowerCase())), [state.workers, q])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title="Workforce" description="Assigned workers across all clients." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Workforce' }]} />
      <input className="input-field mb-4 max-w-md" placeholder="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable rows={slice} columns={[
        { key: 'displayName', label: 'Worker', render: (w) => <Link className="font-medium hover:text-accent" to={\`/workforce/\${w.id}\`}>{w.displayName}</Link> },
        { key: 'role', label: 'Role' },
        { key: 'company', label: 'Company', render: (w) => state.companies.find((c) => c.id === w.companyId)?.name },
        { key: 'location', label: 'Location' },
        { key: 'status', label: 'Status', render: (w) => <Badge tone={statusTone(w.status)}>{w.status}</Badge> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
`)

w('WorkforceDetailPage.jsx', `import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function WorkforceDetailPage() {
  const { id } = useParams()
  const { state } = useData()
  const worker = state.workers.find((w) => w.id === id)
  if (!worker) return <EmptyState title="Worker not found" actionLabel="Back" actionTo="/workforce" />
  const timesheets = state.timesheets.filter((t) => t.workerId === id)
  return (
    <div>
      <PageHeader title={worker.displayName} description={\`\${worker.role} · \${worker.location}\`} breadcrumbs={[{ label: 'Workforce', to: '/workforce' }, { label: worker.displayName }]} />
      <div className="mb-4"><Badge tone={statusTone(worker.status)}>{worker.status}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-2 text-sm">
          <p><strong>Pattern:</strong> {worker.pattern}</p>
          <p><strong>Assignment:</strong> {formatDate(worker.startDate)} – {formatDate(worker.endDate)}</p>
          <p><strong>Placement:</strong> <Link className="text-accent" to={\`/placements/\${worker.placementId}\`}>{worker.placementId}</Link></p>
        </Card>
        <Card className="space-y-2 text-sm">
          <p className="font-display text-sm font-bold uppercase">Timesheets</p>
          {timesheets.map((t) => <Link key={t.id} className="block text-accent" to={\`/timesheets/\${t.id}\`}>WE {formatDate(t.weekEnding)} · {t.status}</Link>)}
        </Card>
      </div>
    </div>
  )
}
`)

console.log('batch3 done')
