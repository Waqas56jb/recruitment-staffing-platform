import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { formatDate } from '../utils/format'

export default function TimesheetsPage() {
  const { state } = useData()
  const { t } = useI18n()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => {
    return state.timesheets
      .filter((ts) => ts.companyId === state.companyId)
      .filter((ts) => !status || ts.status === status)
      .sort((a, b) => b.weekEnding.localeCompare(a.weekEnding))
  }, [state, status])
  const slice = rows.slice((page - 1) * 5, page * 5)

  return (
    <div>
      <PageHeader title={t('Timesheets')} description={t('Review submitted hours for your workers.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Timesheets') }]} />
      <div className="mb-4 max-w-xs">
        <select className="input-field" aria-label={t('Status')} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">{t('All statuses')}</option>
          {['Draft', 'Submitted', 'Approved', 'Rejected'].map((s) => <option key={s} value={s}>{t(s)}</option>)}
        </select>
      </div>
      <DataTable
        rows={slice}
        columns={[
          { key: 'weekEnding', label: t('Week ending'), render: (ts) => <Link className="font-medium hover:text-accent" to={`/timesheets/${ts.id}`}>{formatDate(ts.weekEnding)}</Link> },
          { key: 'worker', label: t('Worker'), render: (ts) => state.workers.find((w) => w.id === ts.workerId)?.displayName || '—' },
          { key: 'totalHours', label: t('Total hours') },
          { key: 'regularHours', label: t('Regular') },
          { key: 'overtimeHours', label: t('Overtime') },
          { key: 'status', label: t('Status'), render: (ts) => <Badge tone={statusTone(ts.status)}>{t(ts.status)}</Badge> },
        ]}
      />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
