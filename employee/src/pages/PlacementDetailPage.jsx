import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { formatDate, formatMoney } from '../utils/format'

export default function PlacementDetailPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const { state } = useData()
  const placement = state.placements.find((p) => p.id === id && p.companyId === state.companyId)
  if (!placement) return <EmptyState title={t('Placement not found')} actionLabel={t('Back to placements')} actionTo="/placements" />
  const candidate = state.candidates.find((c) => c.id === placement.candidateId)
  const worker = state.workers.find((w) => w.id === placement.workerId)

  return (
    <div>
      <PageHeader
        title={placement.role}
        description={`${candidate?.fullName || t('Candidate')} · ${placement.location}`}
        breadcrumbs={[{ label: t('Placements'), to: '/placements' }, { label: placement.role }]}
        actions={<Button to={`/workforce/${worker?.id || ''}`} variant="outline" disabled={!worker}>{t('View worker')}</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone={statusTone(placement.status)}>{t(placement.status)}</Badge>
        <Badge tone="cream">{t(placement.employmentType)}</Badge>
        <Badge tone="muted">{placement.contractRef}</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p><strong>{t('Department:')}</strong> {placement.department}</p>
          <p><strong>{t('Dates:')}</strong> {formatDate(placement.startDate)} – {formatDate(placement.endDate)}</p>
          <p><strong>{t('Rate:')}</strong> {formatMoney(placement.rate)} / {t(placement.rateUnit)}</p>
          <p><strong>{t('Candidate:')}</strong> {candidate ? <Link className="text-accent" to={`/candidates/${candidate.id}`}>{candidate.fullName}</Link> : '—'}</p>
          <p className="text-xs text-muted">{t('Placement details stored for this engagement.')}</p>
        </Card>
        <Card className="space-y-3 text-sm">
          <p className="font-display text-sm font-semibold">{t('Linked records')}</p>
          {placement.staffingRequestId ? <Link className="block text-accent" to={`/staffing-requests/${placement.staffingRequestId}`}>{t('Staffing request')}</Link> : null}
          <Link className="block text-accent" to="/timesheets">{t('Timesheets')}</Link>
          <Link className="block text-accent" to="/documents">{t('Documents')}</Link>
        </Card>
      </div>
    </div>
  )
}
