import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function WorkforceDetailPage() {
  const { id } = useParams()
  const { state } = useData()
  const worker = state.workers.find((w) => w.id === id)
  if (!worker) return <EmptyState title="Worker not found" actionLabel="Back" actionTo="/workforce" />
  const timesheets = state.timesheets.filter((t) => t.workerId === id)
  return (
    <div>
      <PageHeader title={worker.displayName} description={`${worker.role} · ${worker.location}`} breadcrumbs={[{ label: 'Workforce', to: '/workforce' }, { label: worker.displayName }]} />
      <div className="mb-4"><Badge tone={statusTone(worker.status)}>{worker.status}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-2 text-sm">
          <p><strong>Pattern:</strong> {worker.pattern}</p>
          <p><strong>Assignment:</strong> {formatDate(worker.startDate)} – {formatDate(worker.endDate)}</p>
          <p><strong>Placement:</strong> <Link className="text-accent" to={`/placements/${worker.placementId}`}>{worker.placementId}</Link></p>
        </Card>
        <Card className="space-y-2 text-sm">
          <p className="font-display text-sm font-semibold">Timesheets</p>
          {timesheets.map((t) => <Link key={t.id} className="block text-accent" to={`/timesheets/${t.id}`}>WE {formatDate(t.weekEnding)} · {t.status}</Link>)}
        </Card>
      </div>
    </div>
  )
}
