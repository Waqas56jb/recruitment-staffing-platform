import { useMemo, useState } from 'react'
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
        { key: 'title', label: 'Job', render: (j) => <Link className="font-medium hover:text-accent" to={`/jobs/${j.id}`}>{j.title}</Link> },
        { key: 'company', label: 'Company', render: (j) => state.companies.find((c) => c.id === j.companyId)?.name || '—' },
        { key: 'location', label: 'Location' },
        { key: 'postedAt', label: 'Posted', render: (j) => formatDate(j.postedAt) },
        { key: 'status', label: 'Status', render: (j) => <Badge tone={statusTone(j.status)}>{j.status}</Badge> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
