import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function ApplicationsPage() {
  const { state } = useData()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => {
    return state.applications
      .filter((a) => a.candidateId === state.candidateProfileId)
      .filter((a) => !status || a.status === status)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [state, status])
  const slice = rows.slice((page - 1) * 5, page * 5)

  return (
    <div>
      <PageHeader title="Applications" description="Track demo applications linked to your candidate profile." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Applications' }]} />
      <select className="input-field mb-4 max-w-xs" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
        <option value="">All statuses</option>
        {['Submitted', 'Under Review', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected', 'Withdrawn'].map((s) => <option key={s}>{s}</option>)}
      </select>
      <DataTable
        rows={slice}
        columns={[
          { key: 'job', label: 'Role', render: (a) => {
            const job = state.jobs.find((j) => j.id === a.jobId)
            return <Link className="font-medium hover:text-accent" to={`/applications/${a.id}`}>{job?.title || a.jobId}</Link>
          } },
          { key: 'appliedAt', label: 'Applied', render: (a) => formatDate(a.appliedAt) },
          { key: 'updatedAt', label: 'Updated', render: (a) => formatDate(a.updatedAt) },
          { key: 'status', label: 'Status', render: (a) => <Badge tone={statusTone(a.status)}>{a.status}</Badge> },
        ]}
      />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
