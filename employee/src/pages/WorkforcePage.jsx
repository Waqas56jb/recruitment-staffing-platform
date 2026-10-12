import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function WorkforcePage() {
  const { state } = useData()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => {
    return state.workers
      .filter((w) => w.companyId === state.companyId)
      .filter((w) => !status || w.status === status)
      .filter((w) => !q || `${w.displayName} ${w.role} ${w.location}`.toLowerCase().includes(q.toLowerCase()))
  }, [state, q, status])
  const slice = rows.slice((page - 1) * 5, page * 5)

  return (
    <div>
      <PageHeader title="Workforce" description="Assigned workers linked to your active placements." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Workforce' }]} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input className="input-field" placeholder="Search name, role, location" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        <select className="input-field" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          {['Assigned', 'On leave', 'Ended'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <DataTable
        rows={slice}
        columns={[
          { key: 'displayName', label: 'Worker', render: (w) => <Link className="font-medium hover:text-accent" to={`/workforce/${w.id}`}>{w.displayName}</Link> },
          { key: 'role', label: 'Role' },
          { key: 'location', label: 'Location' },
          { key: 'pattern', label: 'Pattern' },
          { key: 'startDate', label: 'Start', render: (w) => formatDate(w.startDate) },
          { key: 'status', label: 'Status', render: (w) => <Badge tone={statusTone(w.status)}>{w.status}</Badge> },
        ]}
      />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
