import { useMemo, useState } from 'react'
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
  const rows = useMemo(() => state.staffingRequests
    .filter((r) => r.companyId === state.companyId)
    .filter((r) => !status || r.status === status)
    .filter((r) => !q || `${r.title} ${r.role} ${r.location}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [state, q, status])
  const slice = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div>
      <PageHeader title="Staffing requests" description="Create and track workforce briefs." actions={<Button to="/staffing-requests/new">New request</Button>} breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Staffing requests' }]} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input className="input-field" placeholder="Search title, role, location" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        <select className="input-field" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          {['Draft', 'Submitted', 'Under Review', 'Sourcing Candidates', 'Shortlisting', 'Interviews', 'Filled', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <DataTable
        rows={slice}
        columns={[
          { key: 'title', label: 'Request', render: (r) => <Link className="font-medium hover:text-accent" to={`/staffing-requests/${r.id}`}>{r.title}</Link> },
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
