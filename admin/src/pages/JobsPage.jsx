import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'
import { useI18n } from '../i18n'

export default function JobsPage() {
  const { state } = useData()
  const { t } = useI18n()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.jobs
    .filter((j) => !status || j.status === status)
    .filter((j) => !q || (j.title + j.location).toLowerCase().includes(q.toLowerCase())), [state.jobs, q, status])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title={t('Jobs')} description={t('Agency job listings (sample + draft).')} actions={<Button to="/jobs/new">{t('New job')}</Button>} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Jobs') }]} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input className="input-field" placeholder={t('Search')} aria-label={t('Search')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        <select className="input-field" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">{t('All statuses')}</option>
          {['Draft','Published','Closed'].map((s) => <option key={s} value={s}>{t(s)}</option>)}
        </select>
      </div>
      <DataTable rows={slice} columns={[
        { key: 'title', label: t('Job'), render: (j) => <Link className="font-medium hover:text-accent" to={`/jobs/${j.id}`}>{j.title}</Link> },
        { key: 'company', label: t('Company'), render: (j) => state.companies.find((c) => c.id === j.companyId)?.name || '—' },
        { key: 'location', label: t('Location') },
        { key: 'postedAt', label: t('Posted'), render: (j) => formatDate(j.postedAt) },
        { key: 'status', label: t('Status'), render: (j) => <Badge tone={statusTone(j.status)}>{t(j.status)}</Badge> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
