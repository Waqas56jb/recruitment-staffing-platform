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
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => {
    return state.placements
      .filter((p) => p.companyId === state.companyId)
      .filter((p) => !status || p.status === status)
      .filter((p) => {
        const cand = state.candidates.find((c) => c.id === p.candidateId)
        const hay = `${p.role} ${p.location} ${cand?.fullName || ''}`.toLowerCase()
        return !q || hay.includes(q.toLowerCase())
      })
  }, [state, q, status])
  const slice = rows.slice((page - 1) * 5, page * 5)

  return (
    <div>
      <PageHeader title="Placements" description="Confirmed assignments for your organisation (demo data)." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Placements' }]} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input className="input-field" placeholder="Search role, location, candidate" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        <select className="input-field" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          {['Confirmed', 'Active', 'Completed', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <DataTable
        rows={slice}
        columns={[
          { key: 'role', label: 'Placement', render: (p) => <Link className="font-medium hover:text-accent" to={`/placements/${p.id}`}>{p.role}</Link> },
          { key: 'candidate', label: 'Candidate', render: (p) => state.candidates.find((c) => c.id === p.candidateId)?.fullName || '—' },
          { key: 'location', label: 'Location' },
          { key: 'startDate', label: 'Start', render: (p) => formatDate(p.startDate) },
          { key: 'rate', label: 'Rate', render: (p) => `${formatMoney(p.rate)} / ${p.rateUnit}` },
          { key: 'status', label: 'Status', render: (p) => <Badge tone={statusTone(p.status)}>{p.status}</Badge> },
        ]}
      />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
