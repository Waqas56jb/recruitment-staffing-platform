import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function JobDetailPage() {
  const { id } = useParams()
  const { state, updateJob } = useData()
  const job = state.jobs.find((j) => j.id === id)
  if (!job) return <EmptyState title="Job not found" actionLabel="Back" actionTo="/jobs" />
  const company = state.companies.find((c) => c.id === job.companyId)
  const apps = state.applications.filter((a) => a.jobId === id)
  return (
    <div>
      <PageHeader title={job.title} description={`${job.location} · ${company?.name || ''}`} breadcrumbs={[{ label: 'Jobs', to: '/jobs' }, { label: job.title }]} actions={<Button to={`/jobs/${job.id}/edit`} variant="outline">Edit</Button>} />
      <div className="mb-4 flex flex-wrap gap-2"><Badge tone={statusTone(job.status)}>{job.status}</Badge>{job.isSample ? <Badge tone="gold">Sample</Badge> : null}</div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p>{job.description}</p>
          <p><strong>Posted:</strong> {formatDate(job.postedAt)}</p>
          <p><strong>Skills:</strong> {(job.skills || []).join(', ')}</p>
          {job.status === 'Draft' ? <Button onClick={() => updateJob(job.id, { status: 'Published' })}>Publish</Button> : null}
        </Card>
        <Card className="space-y-2 text-sm">
          <p className="font-display text-sm font-semibold">Applications ({apps.length})</p>
          {apps.map((a) => {
            const cand = state.candidates.find((c) => c.id === a.candidateId)
            return <Link key={a.id} className="block text-accent" to={`/candidates/${a.candidateId}`}>{cand?.fullName} · {a.status}</Link>
          })}
          <Link className="block text-xs font-semibold text-accent pt-2" to="/recruitment">Recruitment board</Link>
        </Card>
      </div>
    </div>
  )
}
