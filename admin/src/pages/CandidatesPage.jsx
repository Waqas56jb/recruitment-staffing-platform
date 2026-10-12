import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'

export default function CandidatesPage() {
  const { t } = useI18n()
  const { state } = useData()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.candidates.filter((c) => !q || `${c.fullName} ${c.skills.join(' ')} ${c.city}`.toLowerCase().includes(q.toLowerCase())), [state.candidates, q])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title={t('Candidates')} description={t('Talent pool for agency recruiters (demo).')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Candidates') }]} />
      <input className="input-field mb-4 max-w-md" placeholder={t('Search candidates')} aria-label={t('Search candidates')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable rows={slice} columns={[
        { key: 'fullName', label: t('Candidate'), render: (c) => <Link className="font-medium hover:text-accent" to={`/candidates/${c.id}`}>{c.fullName}</Link> },
        { key: 'city', label: t('Location') },
        { key: 'availability', label: t('Availability'), render: (c) => t(c.availability) },
        { key: 'status', label: t('Status'), render: (c) => <Badge tone={statusTone(c.status)}>{t(c.status)}</Badge> },
        { key: 'skills', label: t('Skills'), render: (c) => c.skills.slice(0, 3).join(', ') },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
