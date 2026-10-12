import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { formatDate } from '../utils/format'

export default function WorkforceDetailPage() {
  const { id } = useParams()
  const { state } = useData()
  const { t } = useI18n()
  const worker = state.workers.find((w) => w.id === id)
  if (!worker) return <EmptyState title={t('Worker not found')} actionLabel={t('Back')} actionTo="/workforce" />
  const timesheets = state.timesheets.filter((ts) => ts.workerId === id)
  return (
    <div>
      <PageHeader title={worker.displayName} description={`${t(worker.role)} · ${worker.location}`} breadcrumbs={[{ label: t('Workforce'), to: '/workforce' }, { label: worker.displayName }]} />
      <div className="mb-4"><Badge tone={statusTone(worker.status)}>{t(worker.status)}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-2 text-sm">
          <p><strong>{t('Pattern:')}</strong> {t(worker.pattern)}</p>
          <p><strong>{t('Assignment:')}</strong> {formatDate(worker.startDate)} – {formatDate(worker.endDate)}</p>
          <p><strong>{t('Placement:')}</strong> <Link className="text-accent" to={`/placements/${worker.placementId}`}>{worker.placementId}</Link></p>
        </Card>
        <Card className="space-y-2 text-sm">
          <p className="font-display text-sm font-semibold">{t('Timesheets')}</p>
          {timesheets.map((ts) => <Link key={ts.id} className="block text-accent" to={`/timesheets/${ts.id}`}>{t('WE {date} · {status}', { date: formatDate(ts.weekEnding), status: t(ts.status) })}</Link>)}
        </Card>
      </div>
    </div>
  )
}
