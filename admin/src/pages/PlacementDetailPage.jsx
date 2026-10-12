import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { formatDate, formatMoney } from '../utils/format'

export default function PlacementDetailPage() {
  const { id } = useParams()
  const { state } = useData()
  const { t } = useI18n()
  const placement = state.placements.find((p) => p.id === id)
  if (!placement) return <EmptyState title={t('Placement not found')} actionLabel={t('Back')} actionTo="/placements" />
  const cand = state.candidates.find((c) => c.id === placement.candidateId)
  const company = state.companies.find((c) => c.id === placement.companyId)
  return (
    <div>
      <PageHeader title={placement.role} description={`${cand?.fullName} @ ${company?.name}`} breadcrumbs={[{ label: t('Placements'), to: '/placements' }, { label: placement.role }]} />
      <div className="mb-4"><Badge tone={statusTone(placement.status)}>{t(placement.status)}</Badge> <Badge tone="muted">{placement.contractRef}</Badge></div>
      <Card className="space-y-2 text-sm">
        <p><strong>{t('Location:')}</strong> {placement.location}</p>
        <p><strong>{t('Dates:')}</strong> {formatDate(placement.startDate)} – {formatDate(placement.endDate)}</p>
        <p><strong>{t('Rate:')}</strong> {formatMoney(placement.rate)} / {t(placement.rateUnit)}</p>
        <p><strong>{t('Worker:')}</strong> <Link className="text-accent" to={`/workforce/${placement.workerId}`}>{placement.workerId}</Link></p>
        <p><strong>{t('Candidate:')}</strong> <Link className="text-accent" to={`/candidates/${placement.candidateId}`}>{cand?.fullName}</Link></p>
      </Card>
    </div>
  )
}
