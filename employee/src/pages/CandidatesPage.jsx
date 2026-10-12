import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge'
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
  const companyJobs = state.jobs.filter((j) => j.companyId === state.companyId)
  const rows = useMemo(() => {
    const relevantApps = state.applications.filter((a) => companyJobs.some((j) => j.id === a.jobId))
    return state.candidates
      .filter((c) => relevantApps.some((a) => a.candidateId === c.id) || c.preferences?.locations?.some((l) => l.includes('Birmingham')))
      .filter((c) => !q || `${c.fullName} ${c.skills.join(' ')} ${c.city}`.toLowerCase().includes(q.toLowerCase()))
  }, [state, companyJobs, q])
  const slice = rows.slice((page - 1) * 5, page * 5)

  return (
    <div>
      <PageHeader title={t('Candidate review')} description={t('Demonstration candidates matched to your staffing activity. Private contact details are limited in this employer view.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Candidates') }]} />
      <input className="input-field mb-4 max-w-md" placeholder={t('Search name, skills, location')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable
        rows={slice}
        columns={[
          { key: 'fullName', label: t('Candidate'), render: (c) => <Link className="font-medium hover:text-accent" to={`/candidates/${c.id}`}>{c.fullName}</Link> },
          { key: 'headline', label: t('Profile') },
          { key: 'city', label: t('Location') },
          { key: 'availability', label: t('Availability'), render: (c) => t(c.availability) },
          { key: 'skills', label: t('Skills'), render: (c) => <div className="flex flex-wrap gap-1">{c.skills.slice(0, 3).map((s) => <Badge key={s} tone="cream">{s}</Badge>)}</div> },
        ]}
      />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
