import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'

export default function CandidatesPage() {
  const { state } = useData()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.candidates.filter((c) => !q || `${c.fullName} ${c.skills.join(' ')} ${c.city}`.toLowerCase().includes(q.toLowerCase())), [state.candidates, q])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title="Candidates" description="Talent pool for agency recruiters (demo)." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Candidates' }]} />
      <input className="input-field mb-4 max-w-md" placeholder="Search candidates" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable rows={slice} columns={[
        { key: 'fullName', label: 'Candidate', render: (c) => <Link className="font-medium hover:text-accent" to={`/candidates/${c.id}`}>{c.fullName}</Link> },
        { key: 'city', label: 'Location' },
        { key: 'availability', label: 'Availability' },
        { key: 'status', label: 'Status', render: (c) => <Badge tone={statusTone(c.status)}>{c.status}</Badge> },
        { key: 'skills', label: 'Skills', render: (c) => c.skills.slice(0, 3).join(', ') },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
