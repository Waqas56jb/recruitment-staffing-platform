import { Link } from 'react-router-dom'
import { Building2, ClipboardList, Users, Briefcase, Clock3, Receipt } from 'lucide-react'
import Badge, { statusTone } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function DashboardPage() {
  const { state } = useData()
  const openRequests = state.staffingRequests.filter((r) => !['Filled', 'Cancelled', 'Draft'].includes(r.status))
  const publishedJobs = state.jobs.filter((j) => j.status === 'Published')
  const pendingTs = state.timesheets.filter((t) => t.status === 'Submitted')
  const openInv = state.invoices.filter((i) => ['Issued', 'Overdue', 'Partially Paid'].includes(i.status))

  return (
    <div>
      <PageHeader title="Admin dashboard" description="Companies, recruitment, and operations across the agency." breadcrumbs={[{ label: 'Home' }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Companies" value={state.companies.length} icon={Building2} />
        <StatCard label="Candidates" value={state.candidates.length} icon={Users} />
        <StatCard label="Open requests" value={openRequests.length} icon={ClipboardList} />
        <StatCard label="Published jobs" value={publishedJobs.length} icon={Briefcase} />
        <StatCard label="Timesheets to review" value={pendingTs.length} icon={Clock3} />
        <StatCard label="Open invoices" value={openInv.length} icon={Receipt} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex justify-between"><h2 className="font-display text-lg font-semibold">Recent requests</h2><Link to="/staffing-requests" className="text-xs font-semibold text-accent">View all</Link></div>
          <div className="space-y-2">
            {state.staffingRequests.slice(0, 5).map((r) => (
              <Link key={r.id} to={`/staffing-requests/${r.id}`} className="flex items-center justify-between rounded-md border border-line px-3 py-2 hover:bg-paper">
                <div><p className="font-medium">{r.title}</p><p className="text-xs text-muted">{formatDate(r.updatedAt)}</p></div>
                <Badge tone={statusTone(r.status)}>{r.status}</Badge>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex justify-between"><h2 className="font-display text-lg font-semibold">Audit trail</h2><Link to="/audit-log" className="text-xs font-semibold text-accent">Full log</Link></div>
          <div className="space-y-2">
            {state.auditEvents.slice(0, 5).map((e) => (
              <div key={e.id} className="rounded-md border border-line px-3 py-2 text-sm">
                <p className="font-medium">{e.summary}</p>
                <p className="text-xs text-muted">{e.actor} · {formatDate(e.timestamp)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
