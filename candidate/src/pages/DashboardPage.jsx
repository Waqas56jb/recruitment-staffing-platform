import { Link } from 'react-router-dom'
import { Bookmark, CalendarDays, Send, Briefcase } from 'lucide-react'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import { useData } from '../context/DataContext'
import { formatDate, formatDateTime } from '../utils/format'
import { useI18n } from '../i18n'

export default function DashboardPage() {
  const { t } = useI18n()
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
        title={t('Dashboard')}
        description={t('Your applications, interviews, and saved roles.')}
        breadcrumbs={[{ label: t('Home') }]}
        actions={<Button to="/jobs">{t('Browse jobs')}</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('Applications')} value={apps.length} icon={Send} />
        <StatCard label={t('Saved jobs')} value={saved} icon={Bookmark} />
        <StatCard label={t('Interviews')} value={interviews.length} icon={CalendarDays} />
        <StatCard label={t('Open listings')} value={openJobs} icon={Briefcase} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">{t('Recent applications')}</h2>
            <Link to="/applications" className="text-xs font-semibold text-accent">{t('View all')}</Link>
          </div>
          <div className="space-y-3">
            {apps.map((a) => {
              const job = state.jobs.find((j) => j.id === a.jobId)
              return (
                <Link key={a.id} to={`/applications/${a.id}`} className="flex items-center justify-between rounded-md border border-line px-3 py-2 hover:bg-paper">
                  <div>
                    <p className="font-medium">{job?.title || a.jobId}</p>
                    <p className="text-xs text-muted">{t('Updated {date}', { date: formatDate(a.updatedAt) })}</p>
                  </div>
                  <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                </Link>
              )
            })}
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">{t('Upcoming interviews')}</h2>
            <Link to="/interviews" className="text-xs font-semibold text-accent">{t('Schedule')}</Link>
          </div>
          {interviews.length ? interviews.map((i) => {
            const job = state.jobs.find((j) => j.id === i.jobId)
            return (
              <div key={i.id} className="mb-3 rounded-md border border-line px-3 py-2">
                <p className="font-medium">{job?.title}</p>
                <p className="text-xs text-muted">{formatDateTime(i.datetime)} · {t(i.type)}</p>
              </div>
            )
          }) : <p className="text-sm text-muted">{t('No interviews scheduled.')}</p>}
          {notes.length ? (
            <p className="mt-4 text-sm text-muted">{notes.length === 1 ? t('{count} unread notification', { count: notes.length }) : t('{count} unread notifications', { count: notes.length })} — <Link className="text-accent" to="/notifications">{t('review')}</Link></p>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
