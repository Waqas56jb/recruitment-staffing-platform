import { Link } from 'react-router-dom'
import { Briefcase, ClipboardList, Clock3, HardHat, Receipt, Users } from 'lucide-react'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { formatDate } from '../utils/format'

export default function DashboardPage() {
  const { t } = useI18n()
  const { state } = useData()
  const cid = state.companyId
  const requests = state.staffingRequests.filter((r) => r.companyId === cid)
  const activeRequests = requests.filter((r) => !['Filled', 'Cancelled', 'Draft'].includes(r.status))
  const placements = state.placements.filter((p) => p.companyId === cid)
  const workers = state.workers.filter((w) => w.companyId === cid)
  const timesheets = state.timesheets.filter((ts) => ts.companyId === cid && ts.status === 'Submitted')
  const invoices = state.invoices.filter((i) => i.companyId === cid && ['Issued', 'Overdue', 'Partially Paid'].includes(i.status))
  const shortlisted = state.applications.filter(
    (a) =>
      ['Shortlisted', 'Interview', 'Under Review'].includes(a.status) &&
      state.jobs.some((j) => j.id === a.jobId && j.companyId === cid),
  )

  return (
    <div>
      <PageHeader
        title={t('Dashboard')}
        description={t('Overview of requests, workers, and invoices for your company.')}
        breadcrumbs={[{ label: t('Home') }]}
        actions={<Button to="/staffing-requests/new">{t('New staffing request')}</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label={t('Active requests')} value={activeRequests.length} icon={ClipboardList} />
        <StatCard label={t('Candidates in review')} value={shortlisted.length} icon={Users} />
        <StatCard label={t('Active placements')} value={placements.length} icon={Briefcase} />
        <StatCard label={t('Assigned workers')} value={workers.length} icon={HardHat} />
        <StatCard label={t('Timesheets to approve')} value={timesheets.length} icon={Clock3} />
        <StatCard label={t('Outstanding invoices')} value={invoices.length} icon={Receipt} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">{t('Recent requests')}</h2>
            <Link to="/staffing-requests" className="text-xs font-semibold text-accent">{t('View all')}</Link>
          </div>
          <div className="space-y-3">
            {requests.slice(0, 4).map((r) => (
              <Link key={r.id} to={`/staffing-requests/${r.id}`} className="flex items-center justify-between rounded-md border border-line px-3 py-2 hover:bg-paper">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted">{t(r.role)} · {formatDate(r.updatedAt)}</p>
                </div>
                <Badge tone={statusTone(r.status)}>{t(r.status)}</Badge>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">{t('Timesheet reminders')}</h2>
            <Link to="/timesheets" className="text-xs font-semibold text-accent">{t('Review')}</Link>
          </div>
          <div className="space-y-3">
            {timesheets.length ? timesheets.map((ts) => (
              <Link key={ts.id} to={`/timesheets/${ts.id}`} className="flex items-center justify-between rounded-md border border-line px-3 py-2 hover:bg-paper">
                <div>
                  <p className="font-medium">{t('Week ending {date}', { date: formatDate(ts.weekEnding) })}</p>
                  <p className="text-xs text-muted">{t('{count} hours', { count: ts.totalHours })} · {t('Submitted')}</p>
                </div>
                <Badge tone="warning">{t('Action needed')}</Badge>
              </Link>
            )) : <p className="text-sm text-muted">{t('No timesheets awaiting approval.')}</p>}
          </div>
          <div className="mt-6 border-t border-line pt-4">
            <h3 className="font-display text-sm font-semibold">{t('Quick actions')}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button to="/candidates" variant="outline" size="sm">{t('Review candidates')}</Button>
              <Button to="/invoices" variant="outline" size="sm">{t('View invoices')}</Button>
              <Button to="/workforce" variant="outline" size="sm">{t('Workforce')}</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
