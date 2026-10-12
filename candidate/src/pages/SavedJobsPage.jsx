import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'

export default function SavedJobsPage() {
  const { state, toggleSavedJob } = useData()
  const jobs = state.jobs.filter((j) => state.savedJobIds.includes(j.id))

  return (
    <div>
      <PageHeader title="Saved jobs" description="Roles you have saved on your account." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Saved jobs' }]} />
      {!jobs.length ? (
        <EmptyState title="No saved jobs" description="Browse listings and save roles to revisit them." actionLabel="Find jobs" actionTo="/jobs" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Link to={`/jobs/${job.id}`} className="font-display text-xl font-semibold hover:text-accent">{job.title}</Link>
                {job.isSample ? <Badge tone="gold">Sample</Badge> : null}
              </div>
              <p className="text-sm text-muted">{job.location} · {job.employmentType}</p>
              <div className="flex gap-2">
                <Button to={`/jobs/${job.id}`} size="sm">Open</Button>
                <Button size="sm" variant="outline" onClick={() => toggleSavedJob(job.id)}>Remove</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
