import { useMemo, useState } from 'react'
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
    return !q || `${p.role} ${cand?.fullName || ''} ${p.location}`.toLowerCase().includes(q.toLowerCase())
  }), [state, q])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title="Placements" description="Confirmed assignments across clients." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Placements' }]} />
      <input className="input-field mb-4 max-w-md" placeholder="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable rows={slice} columns={[
        { key: 'role', label: 'Role', render: (p) => <Link className="font-medium hover:text-accent" to={`/placements/${p.id}`}>{p.role}</Link> },
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
