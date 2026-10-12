import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'
import { useI18n } from '../i18n'

export default function ApplicationsPage() {
  const { t } = useI18n()
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
      <PageHeader title={t('Applications')} description={t('Track demo applications linked to your candidate profile.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Applications') }]} />
      <select aria-label={t('Filter by status')} className="input-field mb-4 max-w-xs" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
        <option value="">{t('All statuses')}</option>
        {['Submitted', 'Under Review', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected', 'Withdrawn'].map((s) => <option key={s} value={s}>{t(s)}</option>)}
      </select>
      <DataTable
        rows={slice}
        columns={[
          { key: 'job', label: t('Role'), render: (a) => {
            const job = state.jobs.find((j) => j.id === a.jobId)
            return <Link className="font-medium hover:text-accent" to={`/applications/${a.id}`}>{job?.title || a.jobId}</Link>
          } },
          { key: 'appliedAt', label: t('Applied'), render: (a) => formatDate(a.appliedAt) },
          { key: 'updatedAt', label: t('Updated'), render: (a) => formatDate(a.updatedAt) },
          { key: 'status', label: t('Status'), render: (a) => <Badge tone={statusTone(a.status)}>{a.status}</Badge> },
        ]}
      />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
