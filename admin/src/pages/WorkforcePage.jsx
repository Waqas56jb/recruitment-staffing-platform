import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'

export default function WorkforcePage() {
  const { state } = useData()
  const { t } = useI18n()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.workers.filter((w) => !q || `${w.displayName} ${w.role} ${w.location}`.toLowerCase().includes(q.toLowerCase())), [state.workers, q])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title={t('Workforce')} description={t('Assigned workers across all clients.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Workforce') }]} />
      <input className="input-field mb-4 max-w-md" placeholder={t('Search')} aria-label={t('Search')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable rows={slice} columns={[
        { key: 'displayName', label: t('Worker'), render: (w) => <Link className="font-medium hover:text-accent" to={`/workforce/${w.id}`}>{w.displayName}</Link> },
        { key: 'role', label: t('Role'), render: (w) => t(w.role) },
        { key: 'company', label: t('Company'), render: (w) => state.companies.find((c) => c.id === w.companyId)?.name },
        { key: 'location', label: t('Location') },
        { key: 'status', label: t('Status'), render: (w) => <Badge tone={statusTone(w.status)}>{t(w.status)}</Badge> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
