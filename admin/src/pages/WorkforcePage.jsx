import { useMemo, useState } from 'react'
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
  const rows = useMemo(() => state.workers.filter((w) => !q || `${w.displayName} ${w.role} ${w.location}`.toLowerCase().includes(q.toLowerCase())), [state.workers, q])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title="Workforce" description="Assigned workers across all clients." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Workforce' }]} />
      <input className="input-field mb-4 max-w-md" placeholder="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable rows={slice} columns={[
        { key: 'displayName', label: 'Worker', render: (w) => <Link className="font-medium hover:text-accent" to={`/workforce/${w.id}`}>{w.displayName}</Link> },
        { key: 'role', label: 'Role' },
        { key: 'company', label: 'Company', render: (w) => state.companies.find((c) => c.id === w.companyId)?.name },
        { key: 'location', label: 'Location' },
        { key: 'status', label: 'Status', render: (w) => <Badge tone={statusTone(w.status)}>{w.status}</Badge> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
