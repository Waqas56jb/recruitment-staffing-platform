import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { formatDate } from '../utils/format'

export default function WorkforcePage() {
  const { state } = useData()
  const { t } = useI18n()
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
      <PageHeader title={t('Workforce')} description={t('Assigned workers linked to your active placements.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Workforce') }]} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input className="input-field" placeholder={t('Search name, role, location')} aria-label={t('Search name, role, location')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        <select className="input-field" aria-label={t('Status')} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">{t('All statuses')}</option>
          {['Assigned', 'On leave', 'Ended'].map((s) => <option key={s} value={s}>{t(s)}</option>)}
        </select>
      </div>
      <DataTable
        rows={slice}
        columns={[
          { key: 'displayName', label: t('Worker'), render: (w) => <Link className="font-medium hover:text-accent" to={`/workforce/${w.id}`}>{w.displayName}</Link> },
          { key: 'role', label: t('Role') },
          { key: 'location', label: t('Location') },
          { key: 'pattern', label: t('Pattern') },
          { key: 'startDate', label: t('Start'), render: (w) => formatDate(w.startDate) },
          { key: 'status', label: t('Status'), render: (w) => <Badge tone={statusTone(w.status)}>{t(w.status)}</Badge> },
        ]}
      />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
