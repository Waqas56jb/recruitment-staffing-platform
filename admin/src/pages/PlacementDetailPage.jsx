import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDate, formatMoney } from '../utils/format'

export default function PlacementDetailPage() {
  const { id } = useParams()
  const { state } = useData()
  const placement = state.placements.find((p) => p.id === id)
  if (!placement) return <EmptyState title="Placement not found" actionLabel="Back" actionTo="/placements" />
  const cand = state.candidates.find((c) => c.id === placement.candidateId)
  const company = state.companies.find((c) => c.id === placement.companyId)
  return (
    <div>
      <PageHeader title={placement.role} description={`${cand?.fullName} @ ${company?.name}`} breadcrumbs={[{ label: 'Placements', to: '/placements' }, { label: placement.role }]} />
      <div className="mb-4"><Badge tone={statusTone(placement.status)}>{placement.status}</Badge> <Badge tone="muted">{placement.contractRef}</Badge></div>
      <Card className="space-y-2 text-sm">
        <p><strong>Location:</strong> {placement.location}</p>
        <p><strong>Dates:</strong> {formatDate(placement.startDate)} – {formatDate(placement.endDate)}</p>
        <p><strong>Rate:</strong> {formatMoney(placement.rate)} / {placement.rateUnit}</p>
        <p><strong>Worker:</strong> <Link className="text-accent" to={`/workforce/${placement.workerId}`}>{placement.workerId}</Link></p>
        <p><strong>Candidate:</strong> <Link className="text-accent" to={`/candidates/${placement.candidateId}`}>{cand?.fullName}</Link></p>
      </Card>
    </div>
  )
}
