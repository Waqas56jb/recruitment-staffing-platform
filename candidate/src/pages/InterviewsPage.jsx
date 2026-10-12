import Badge, { statusTone } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDateTime } from '../utils/format'

export default function InterviewsPage() {
  const { state } = useData()
  const rows = state.interviews.filter((i) => i.candidateId === state.candidateProfileId)

  return (
    <div>
      <PageHeader title="Interviews" description="Scheduled interviews for your demo candidate profile." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Interviews' }]} />
      {!rows.length ? (
        <EmptyState title="No interviews" description="When recruiters schedule interviews in the admin demo, they appear here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((item) => {
            const job = state.jobs.find((j) => j.id === item.jobId)
            const company = state.companies.find((c) => c.id === item.companyId)
            return (
              <Card key={item.id} className="space-y-2 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-xl font-semibold">{job?.title || 'Interview'}</h2>
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                </div>
                <p><strong>When:</strong> {formatDateTime(item.datetime)} ({item.timezone})</p>
                <p><strong>Type:</strong> {item.type}</p>
                <p><strong>Interviewer:</strong> {item.interviewer}</p>
                <p><strong>Company:</strong> {company?.name || '—'}</p>
                <p className="text-muted">{item.locationOrLink}</p>
                {item.feedback ? <p><strong>Feedback:</strong> {item.feedback}</p> : null}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
