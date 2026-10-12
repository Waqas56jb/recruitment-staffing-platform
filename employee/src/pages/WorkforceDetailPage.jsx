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
  const { t } = useI18n()
  const { state } = useData()
  const worker = state.workers.find((w) => w.id === id && w.companyId === state.companyId)
  if (!worker) return <EmptyState title={t('Worker not found')} actionLabel={t('Back to workforce')} actionTo="/workforce" />
  const timesheets = state.timesheets.filter((ts) => ts.workerId === worker.id)
  const docs = state.documents.filter((d) => d.workerId === worker.id)

  return (
    <div>
      <PageHeader
        title={worker.displayName}
        description={`${worker.role} · ${worker.location}`}
        breadcrumbs={[{ label: t('Workforce'), to: '/workforce' }, { label: worker.displayName }]}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone={statusTone(worker.status)}>{t(worker.status)}</Badge>
        <Badge tone="cream">{t(worker.employmentType)}</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p><strong>{t('Department:')}</strong> {worker.department}</p>
          <p><strong>{t('Pattern:')}</strong> {worker.pattern}</p>
          <p><strong>{t('Assignment:')}</strong> {formatDate(worker.startDate)} – {formatDate(worker.endDate)}</p>
          <p><strong>{t('Placement:')}</strong> <Link className="text-accent" to={`/placements/${worker.placementId}`}>{worker.placementId}</Link></p>
        </Card>
        <Card className="space-y-3 text-sm">
          <p className="font-display text-sm font-semibold">{t('Timesheets')}</p>
          {timesheets.length ? timesheets.map((ts) => (
            <Link key={ts.id} to={`/timesheets/${ts.id}`} className="block rounded-md border border-line px-3 py-2 hover:bg-paper">
              {t('Week ending {date}', { date: formatDate(ts.weekEnding) })} · {t(ts.status)}
            </Link>
          )) : <p className="text-muted">{t('No timesheets')}</p>}
          <p className="font-display text-sm font-semibold pt-2">{t('Documents')}</p>
          {docs.length ? docs.map((d) => <p key={d.id}>{d.title}</p>) : <p className="text-muted">{t('No documents')}</p>}
        </Card>
      </div>
    </div>
  )
}
