/**
 * Generates remaining portal pages for employee, candidate, and admin.
 * Run: node server/tools/gen-all-pages.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))), '../..')
const write = (rel, content) => {
  const file = path.join(root, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
  console.log('wrote', rel)
}

// ---------- shared helpers embedded in generated pages via imports ----------

write('employee/src/pages/StaffingRequestsPage.jsx', `import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
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
  const pageSize = 5
  const rows = useMemo(() => {
    return state.staffingRequests
      .filter((r) => r.companyId === state.companyId)
      .filter((r) => !status || r.status === status)
      .filter((r) => !q || (r.title + r.role + r.location).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [state, q, status])
  const slice = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div>
      <PageHeader title="Staffing requests" description="Create and track workforce briefs for your company." actions={<Button to="/staffing-requests/new">New request</Button>} breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Staffing requests' }]} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input className="input-field" placeholder="Search title, role, location" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        <select className="input-field" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          {['Draft','Submitted','Under Review','Sourcing Candidates','Shortlisting','Interviews','Filled','Cancelled'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <DataTable
        rows={slice}
        columns={[
          { key: 'title', label: 'Request', render: (r) => <Link className="font-medium hover:text-accent" to={\`/staffing-requests/\${r.id}\`}>{r.title}</Link> },
          { key: 'role', label: 'Role' },
          { key: 'headcount', label: 'Headcount' },
          { key: 'priority', label: 'Priority' },
          { key: 'status', label: 'Status', render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: 'updatedAt', label: 'Updated', render: (r) => formatDate(r.updatedAt) },
        ]}
      />
      <Pagination page={page} pageSize={pageSize} total={rows.length} onChange={setPage} />
    </div>
  )
}
`)

write('employee/src/pages/StaffingRequestFormPage.jsx', `import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { positiveNumber, required } from '../utils/validation'

const empty = {
  title: '', role: '', department: '', headcount: '1', employmentType: 'Temporary', skills: '',
  qualifications: '', experience: '', location: '', startDate: '', duration: '', hours: '',
  payRange: '', description: '', additional: '', priority: 'Medium', status: 'Draft',
}

export default function StaffingRequestFormPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const { state, createStaffingRequest, updateStaffingRequest } = useData()
  const existing = useMemo(() => state.staffingRequests.find((r) => r.id === id), [state, id])
  const [form, setForm] = useState(() => existing ? { ...existing, skills: (existing.skills || []).join(', '), headcount: String(existing.headcount) } : empty)
  const [errors, setErrors] = useState({})
  const { push } = useToast()
  const navigate = useNavigate()
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const save = (status) => {
    const nextErrors = {
      title: required(form.title),
      role: required(form.role),
      headcount: positiveNumber(form.headcount),
      location: required(form.location),
      employmentType: required(form.employmentType),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    const payload = {
      ...form,
      status,
      headcount: Number(form.headcount),
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    }
    if (isNew || !existing) {
      const item = createStaffingRequest(payload)
      push({ title: status === 'Draft' ? 'Draft saved locally' : 'Request submitted locally', message: 'No data was sent to a server.' })
      navigate(\`/staffing-requests/\${item.id}\`)
    } else {
      updateStaffingRequest(existing.id, payload)
      push({ title: 'Request updated locally', message: 'Demonstration state only.' })
      navigate(\`/staffing-requests/\${existing.id}\`)
    }
  }

  return (
    <div>
      <PageHeader title={isNew ? 'New staffing request' : 'Edit staffing request'} breadcrumbs={[{ label: 'Requests', to: '/staffing-requests' }, { label: isNew ? 'New' : 'Edit' }]} />
      <form className="card-panel grid gap-4 p-5 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save(form.status === 'Draft' ? 'Draft' : form.status) }}>
        {[
          ['title','Request title',true],['role','Job role',true],['department','Department'],['headcount','Employees required',true],
          ['employmentType','Employment type',true,'select',['Temporary','Permanent','Contract']],
          ['skills','Skills (comma separated)'],['qualifications','Qualifications'],['experience','Experience requirements'],
          ['location','Work location',true],['startDate','Start date',false,'date'],['duration','Expected duration'],['hours','Working hours / shifts'],
          ['payRange','Pay range (optional)'],['priority','Priority',false,'select',['Low','Medium','High']],
        ].map(([key,label,req,type,opts]) => (
          <Field key={key} id={key} label={label} required={req} error={errors[key]} className={key==='skills'||key==='qualifications'?'md:col-span-2':''}>
            {type === 'select' ? (
              <select id={key} className="input-field" value={form[key]} onChange={(e) => set(key, e.target.value)}>{opts.map((o) => <option key={o}>{o}</option>)}</select>
            ) : (
              <input id={key} type={type || 'text'} className="input-field" value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />
            )}
          </Field>
        ))}
        <Field id="description" label="Job description" className="md:col-span-2"><textarea id="description" className="input-field" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
        <Field id="additional" label="Additional requirements" className="md:col-span-2"><textarea id="additional" className="input-field" rows={3} value={form.additional} onChange={(e) => set('additional', e.target.value)} /></Field>
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => save('Draft')}>Save draft</Button>
          <Button type="button" onClick={() => save('Submitted')}>Submit request</Button>
        </div>
      </form>
    </div>
  )
}
`)

console.log('partial employee pages...')
