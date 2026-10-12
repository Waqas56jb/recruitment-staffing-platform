import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function TimesheetsPage() {
  const { state } = useData()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.timesheets.filter((t) => !status || t.status === status).sort((a, b) => b.weekEnding.localeCompare(a.weekEnding)), [state.timesheets, status])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title="Timesheets" description="Agency review of submitted hours across clients." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Timesheets' }]} />
      <select className="input-field mb-4 max-w-xs" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
        <option value="">All statuses</option>
        {['Draft','Submitted','Approved','Rejected'].map((s) => <option key={s}>{s}</option>)}
      </select>
      <DataTable rows={slice} columns={[
        { key: 'weekEnding', label: 'Week ending', render: (t) => <Link className="font-medium hover:text-accent" to={`/timesheets/${t.id}`}>{formatDate(t.weekEnding)}</Link> },
        { key: 'worker', label: 'Worker', render: (t) => state.workers.find((w) => w.id === t.workerId)?.displayName },
        { key: 'company', label: 'Company', render: (t) => state.companies.find((c) => c.id === t.companyId)?.name },
        { key: 'totalHours', label: 'Hours' },
        { key: 'status', label: 'Status', render: (t) => <Badge tone={statusTone(t.status)}>{t.status}</Badge> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
