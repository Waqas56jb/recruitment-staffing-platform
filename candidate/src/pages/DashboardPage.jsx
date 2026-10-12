import { Link } from 'react-router-dom'
import { Bookmark, CalendarDays, Send, Briefcase } from 'lucide-react'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import { useData } from '../context/DataContext'
import { formatDate, formatDateTime } from '../utils/format'

export default function DashboardPage() {
  const { state } = useData()
  const cid = state.candidateProfileId
  const apps = state.applications.filter((a) => a.candidateId === cid)
  const interviews = state.interviews.filter((i) => i.candidateId === cid)
  const saved = state.savedJobIds.length
  const openJobs = state.jobs.filter((j) => j.status === 'Published').length
  const notes = state.notifications.filter((n) => n.audience === 'candidate:' + cid && !n.read)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your applications, interviews, and saved roles."
        breadcrumbs={[{ label: 'Home' }]}
        actions={<Button to="/jobs">Browse jobs</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Applications" value={apps.length} icon={Send} />
        <StatCard label="Saved jobs" value={saved} icon={Bookmark} />
        <StatCard label="Interviews" value={interviews.length} icon={CalendarDays} />
        <StatCard label="Open listings" value={openJobs} icon={Briefcase} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent applications</h2>
            <Link to="/applications" className="text-xs font-semibold text-accent">View all</Link>
          </div>
          <div className="space-y-3">
            {apps.map((a) => {
              const job = state.jobs.find((j) => j.id === a.jobId)
              return (
                <Link key={a.id} to={`/applications/${a.id}`} className="flex items-center justify-between rounded-md border border-line px-3 py-2 hover:bg-paper">
                  <div>
                    <p className="font-medium">{job?.title || a.jobId}</p>
                    <p className="text-xs text-muted">Updated {formatDate(a.updatedAt)}</p>
                  </div>
                  <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                </Link>
              )
            })}
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Upcoming interviews</h2>
            <Link to="/interviews" className="text-xs font-semibold text-accent">Schedule</Link>
          </div>
          {interviews.length ? interviews.map((i) => {
            const job = state.jobs.find((j) => j.id === i.jobId)
            return (
              <div key={i.id} className="mb-3 rounded-md border border-line px-3 py-2">
                <p className="font-medium">{job?.title}</p>
                <p className="text-xs text-muted">{formatDateTime(i.datetime)} · {i.type}</p>
              </div>
            )
          }) : <p className="text-sm text-muted">No interviews scheduled.</p>}
          {notes.length ? (
            <p className="mt-4 text-sm text-muted">{notes.length} unread notification{notes.length === 1 ? '' : 's'} — <Link className="text-accent" to="/notifications">review</Link></p>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
