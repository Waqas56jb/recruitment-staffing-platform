import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDate, formatMoney } from '../utils/format'

export default function PlacementDetailPage() {
  const { id } = useParams()
  const { state } = useData()
  const placement = state.placements.find((p) => p.id === id && p.companyId === state.companyId)
  if (!placement) return <EmptyState title="Placement not found" actionLabel="Back to placements" actionTo="/placements" />
  const candidate = state.candidates.find((c) => c.id === placement.candidateId)
  const worker = state.workers.find((w) => w.id === placement.workerId)

  return (
    <div>
      <PageHeader
        title={placement.role}
        description={`${candidate?.fullName || 'Candidate'} · ${placement.location}`}
        breadcrumbs={[{ label: 'Placements', to: '/placements' }, { label: placement.role }]}
        actions={<Button to={`/workforce/${worker?.id || ''}`} variant="outline" disabled={!worker}>View worker</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone={statusTone(placement.status)}>{placement.status}</Badge>
        <Badge tone="cream">{placement.employmentType}</Badge>
        <Badge tone="muted">{placement.contractRef}</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p><strong>Department:</strong> {placement.department}</p>
          <p><strong>Dates:</strong> {formatDate(placement.startDate)} – {formatDate(placement.endDate)}</p>
          <p><strong>Rate:</strong> {formatMoney(placement.rate)} / {placement.rateUnit}</p>
          <p><strong>Candidate:</strong> {candidate ? <Link className="text-accent" to={`/candidates/${candidate.id}`}>{candidate.fullName}</Link> : '—'}</p>
          <p className="text-xs text-muted">Placement details stored for this engagement.</p>
        </Card>
        <Card className="space-y-3 text-sm">
          <p className="font-display text-sm font-semibold">Linked records</p>
          {placement.staffingRequestId ? <Link className="block text-accent" to={`/staffing-requests/${placement.staffingRequestId}`}>Staffing request</Link> : null}
          <Link className="block text-accent" to="/timesheets">Timesheets</Link>
          <Link className="block text-accent" to="/documents">Documents</Link>
        </Card>
      </div>
    </div>
  )
}
