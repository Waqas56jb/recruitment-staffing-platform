import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'

const COLUMNS = ['Submitted', 'Under Review', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected']

export default function RecruitmentPage() {
  const { state, updateApplication, createInterview, createPlacement } = useData()
  const { push } = useToast()
  const { t } = useI18n()
  const [jobFilter, setJobFilter] = useState('')
  const apps = useMemo(() => state.applications.filter((a) => !jobFilter || a.jobId === jobFilter), [state.applications, jobFilter])

  const move = (app, status) => {
    updateApplication(app.id, { status, note: 'Moved on recruitment board (demo)' })
    push({ title: t('Application updated'), message: t('Status is now {status}.', { status: t(status) }) })
  }

  const schedule = (app) => {
    createInterview({
      candidateId: app.candidateId,
      jobId: app.jobId,
      companyId: state.jobs.find((j) => j.id === app.jobId)?.companyId,
      datetime: new Date(Date.now() + 86400000 * 3).toISOString(),
      timezone: 'Europe/London',
      type: 'Video',
      interviewer: 'Sophie Lane',
      locationOrLink: 'Meeting link placeholder (demo)',
    })
    updateApplication(app.id, { status: 'Interview', note: 'Interview scheduled (demo)' })
    push({ title: t('Interview scheduled'), message: t('The interview is saved.') })
  }

  const place = (app) => {
    const job = state.jobs.find((j) => j.id === app.jobId)
    createPlacement({
      candidateId: app.candidateId,
      companyId: job?.companyId,
      staffingRequestId: job?.staffingRequestId || null,
      jobId: app.jobId,
      role: job?.title || 'Role',
      department: job?.category || 'General',
      location: job?.location || 'TBC',
      employmentType: job?.employmentType || 'Temporary',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: null,
      rate: 13,
      rateUnit: 'hour',
    })
    updateApplication(app.id, { status: 'Hired', note: 'Placement created (demo)' })
    push({ title: t('Placement created'), message: t('A worker record was added.') })
  }

  return (
    <div>
      <PageHeader title={t('Recruitment board')} description={t('Kanban of applications. Drag is simulated via action buttons.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Recruitment') }]} />
      <label className="mb-4 block max-w-sm text-sm font-medium" htmlFor="job-filter">
        {t('Job')}
        <select id="job-filter" className="input-field mt-1 w-full" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
          <option value="">{t('All jobs')}</option>
          {state.jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = apps.filter((a) => a.status === col)
          return (
            <section key={col} className="flex min-w-0 flex-col rounded-xl border border-line bg-white p-3">
              <h2 className="mb-3 text-sm font-semibold text-ink">{t(col)} <span className="font-medium text-muted">({items.length})</span></h2>
              <div className="flex flex-1 flex-col gap-3">
                {items.length ? items.map((app) => {
                  const cand = state.candidates.find((c) => c.id === app.candidateId)
                  const job = state.jobs.find((j) => j.id === app.jobId)
                  return (
                    <article key={app.id} className="min-w-0 space-y-2 rounded-lg border border-line bg-cream p-3 text-sm">
                      <p className="break-words font-medium">{cand?.fullName}</p>
                      <p className="break-words text-xs text-muted">{job?.title}</p>
                      <Badge tone={statusTone(app.status)}>{t(app.status)}</Badge>
                      <div className="grid grid-cols-2 gap-1.5">
                        {COLUMNS.filter((c) => c !== app.status).slice(0, 3).map((c) => (
                          <Button key={c} size="sm" variant="outline" className="h-auto w-full whitespace-normal px-2 py-1.5 text-center leading-tight" onClick={() => move(app, c)}>{t(c)}</Button>
                        ))}
                        {app.status === 'Shortlisted' || app.status === 'Under Review' ? <Button size="sm" className="h-auto w-full whitespace-normal px-2 py-1.5 leading-tight" onClick={() => schedule(app)}>{t('Schedule')}</Button> : null}
                        {['Interview', 'Offer', 'Shortlisted'].includes(app.status) ? <Button size="sm" className="h-auto w-full whitespace-normal px-2 py-1.5 leading-tight" onClick={() => place(app)}>{t('Place')}</Button> : null}
                      </div>
                      <Link className="inline-flex text-xs font-medium text-accent" to={`/candidates/${app.candidateId}`}>{t('Profile')}</Link>
                    </article>
                  )
                }) : <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-muted">{t('No applications')}</p>}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
