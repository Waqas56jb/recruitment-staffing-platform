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
  const worker = state.workers.find((w) => w.id === id && w.companyId === state.companyId)
  if (!worker) return <EmptyState title="Worker not found" actionLabel="Back to workforce" actionTo="/workforce" />
  const timesheets = state.timesheets.filter((t) => t.workerId === worker.id)
  const docs = state.documents.filter((d) => d.workerId === worker.id)

  return (
    <div>
      <PageHeader
        title={worker.displayName}
        description={`${worker.role} · ${worker.location}`}
        breadcrumbs={[{ label: 'Workforce', to: '/workforce' }, { label: worker.displayName }]}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone={statusTone(worker.status)}>{worker.status}</Badge>
        <Badge tone="cream">{worker.employmentType}</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p><strong>Department:</strong> {worker.department}</p>
          <p><strong>Pattern:</strong> {worker.pattern}</p>
          <p><strong>Assignment:</strong> {formatDate(worker.startDate)} – {formatDate(worker.endDate)}</p>
          <p><strong>Placement:</strong> <Link className="text-accent" to={`/placements/${worker.placementId}`}>{worker.placementId}</Link></p>
        </Card>
        <Card className="space-y-3 text-sm">
          <p className="font-display text-sm font-semibold">Timesheets</p>
          {timesheets.length ? timesheets.map((t) => (
            <Link key={t.id} to={`/timesheets/${t.id}`} className="block rounded-md border border-line px-3 py-2 hover:bg-paper">
              Week ending {formatDate(t.weekEnding)} · {t.status}
            </Link>
          )) : <p className="text-muted">No timesheets</p>}
          <p className="font-display text-sm font-semibold pt-2">Documents</p>
          {docs.length ? docs.map((d) => <p key={d.id}>{d.title}</p>) : <p className="text-muted">No documents</p>}
        </Card>
      </div>
    </div>
  )
}
