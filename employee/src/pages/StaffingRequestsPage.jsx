import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { formatDate } from '../utils/format'

export default function StaffingRequestsPage() {
  const { state } = useData()
  const { t } = useI18n()
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
      <PageHeader title={t('Staffing requests')} description={t('Create and track workforce briefs.')} actions={<Button to="/staffing-requests/new">{t('New request')}</Button>} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Staffing requests') }]} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input className="input-field" placeholder={t('Search title, role, location')} aria-label={t('Search title, role, location')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        <select className="input-field" aria-label={t('Status')} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">{t('All statuses')}</option>
          {['Draft', 'Submitted', 'Under Review', 'Sourcing Candidates', 'Shortlisting', 'Interviews', 'Filled', 'Cancelled'].map((s) => <option key={s} value={s}>{t(s)}</option>)}
        </select>
      </div>
      <DataTable
        rows={slice}
        columns={[
          { key: 'title', label: t('Request'), render: (r) => <Link className="font-medium hover:text-accent" to={`/staffing-requests/${r.id}`}>{r.title}</Link> },
          { key: 'role', label: t('Role') },
          { key: 'headcount', label: t('Headcount') },
          { key: 'priority', label: t('Priority'), render: (r) => t(r.priority) },
          { key: 'status', label: t('Status'), render: (r) => <Badge tone={statusTone(r.status)}>{t(r.status)}</Badge> },
          { key: 'updatedAt', label: t('Updated'), render: (r) => formatDate(r.updatedAt) },
        ]}
      />
      <Pagination page={page} pageSize={pageSize} total={rows.length} onChange={setPage} />
    </div>
  )
}
