import { Link, useParams } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function CandidateDetailPage() {
  const { id } = useParams()
  const { state } = useData()
  const candidate = state.candidates.find((c) => c.id === id)
  if (!candidate) return <EmptyState title="Candidate not found" actionLabel="Back" actionTo="/candidates" />
  const apps = state.applications.filter((a) => a.candidateId === id)
  return (
    <div>
      <PageHeader title={candidate.fullName} description={candidate.headline} breadcrumbs={[{ label: 'Candidates', to: '/candidates' }, { label: candidate.fullName }]} />
      <div className="mb-4 flex flex-wrap gap-2"><Badge tone="gold">{candidate.status}</Badge><Badge tone="cream">{candidate.availability}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p className="text-muted">{candidate.bio}</p>
          <p><strong>Email:</strong> {candidate.email}</p>
          <p><strong>Phone:</strong> {candidate.phone}</p>
          <p><strong>Skills:</strong> {candidate.skills.join(', ')}</p>
          <div>{candidate.experience.map((ex) => (
            <div key={ex.id} className="mt-2 rounded-md border border-line p-3"><p className="font-medium">{ex.title} · {ex.employer}</p><p className="text-xs text-muted">{ex.startDate} – {ex.current ? 'Present' : ex.endDate}</p></div>
          ))}</div>
        </Card>
        <Card className="space-y-2 text-sm">
          <p className="font-display text-sm font-semibold">Applications</p>
          {apps.length ? apps.map((a) => {
            const job = state.jobs.find((j) => j.id === a.jobId)
            return <Link key={a.id} className="block text-accent" to="/recruitment">{job?.title} · {a.status}</Link>
          }) : <p className="text-muted">None</p>}
          <p className="pt-2 text-xs text-muted">CV: {candidate.cvMeta?.fileName || '—'} · {formatDate(candidate.cvMeta?.updatedAt)}</p>
        </Card>
      </div>
    </div>
  )
}
