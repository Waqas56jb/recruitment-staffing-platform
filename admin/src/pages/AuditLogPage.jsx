import { useMemo, useState } from 'react'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDateTime } from '../utils/format'

export default function AuditLogPage() {
  const { state } = useData()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.auditEvents
    .filter((e) => !q || `${e.actor} ${e.action} ${e.summary}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [state.auditEvents, q])
  const slice = rows.slice((page - 1) * 8, page * 8)
  return (
    <div>
      <PageHeader title="Audit log" description="Changes recorded by Staffora." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Audit log' }]} />
      <input className="input-field mb-4 max-w-md" placeholder="Search events" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable rows={slice} columns={[
        { key: 'timestamp', label: 'When', render: (e) => formatDateTime(e.timestamp) },
        { key: 'actor', label: 'Actor' },
        { key: 'action', label: 'Action' },
        { key: 'entityType', label: 'Entity' },
        { key: 'summary', label: 'Summary' },
      ]} />
      <Pagination page={page} pageSize={8} total={rows.length} onChange={setPage} />
    </div>
  )
}
