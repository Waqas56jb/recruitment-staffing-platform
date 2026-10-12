import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { api } from '@staffora/api'
import JobCard from '../components/cards/JobCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import EmptyState from '../components/ui/EmptyState'
import { formatDate } from '../utils/format'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

export default function JobDetailPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [related, setRelated] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    Promise.all([api(`/api/public/jobs/${id}`), api('/api/public/jobs')])
      .then(([item, list]) => {
        if (cancelled) return
        setJob(item)
        const rows = Array.isArray(list) ? list : []
        setRelated(rows.filter((row) => row.id !== item.id && (row.category === item.category || row.location === item.location)).slice(0, 3))
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) {
          setJob(null)
          setStatus('missing')
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  usePageMeta({
    title: job ? job.title : t('Job'),
    description: job
      ? `${job.title} — ${job.location}.`
      : t('Published Staffora vacancy.'),
  })

  if (status === 'loading') {
    return (
      <section className="section-pad bg-cream pt-36">
        <Container><p className="text-sm text-muted">{t('Loading role…')}</p></Container>
      </section>
    )
  }

  if (!job) {
    return (
      <section className="section-pad bg-cream pt-36">
        <Container>
          <EmptyState
            title={t('Job not found')}
            description={t('This role is not published, or it has been removed.')}
            actionLabel={t('Back to jobs')}
            actionTo="/jobs"
          />
        </Container>
      </section>
    )
  }

  return (
    <>
      <section className="bg-ink pt-32 text-cream">
        <Container className="pb-14">
          <p className="text-sm text-cream/60">
            <Link to="/jobs" className="hover:text-cream">
              {t('Jobs')}
            </Link>{' '}
            / {job.title}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {job.isSample ? <Badge tone="gold">{t('Sample Listing')}</Badge> : null}
            <Badge tone="soft">{t(job.employmentType)}</Badge>
            <Badge tone="soft">{t(job.category)}</Badge>
          </div>
          <h1 className="display-xl mt-5">{job.title}</h1>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-cream/75">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden />
              {job.location}
            </span>
            <span>{job.department}</span>
            <span>{job.salaryLabel}</span>
            <span>{t('Posted {date}', { date: formatDate(job.postedAt) })}</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/candidates#interest">{t('Apply / register interest')}</Button>
            <Button to="/jobs" variant="lightOutline">
              {t('More jobs')}
            </Button>
          </div>
        </Container>
      </section>

      <section className="section-pad bg-cream">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-10">
              <div>
                <h2 className="display-md">{t('About the role')}</h2>
                <p className="mt-4 leading-relaxed text-muted">{job.description}</p>
              </div>
              <div>
                <h2 className="display-md">{t('Responsibilities')}</h2>
                <ul className="mt-4 space-y-2 text-muted">
                  {(job.responsibilities || []).map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="display-md">{t('Requirements')}</h2>
                <ul className="mt-4 space-y-2 text-muted">
                  {(job.requirements || []).map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h2 className="font-display text-xl font-bold tracking-tight">
                {t('Application instructions')}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t('Create a candidate account to apply, or register your interest and the team will follow up.')}
              </p>
              <div className="mt-6">
                <Button to="/candidates#interest" className="w-full">
                  {t('Register interest')}
                </Button>
              </div>
              <div className="mt-3">
                <Button to="/contact" variant="ghost" className="w-full">
                  {t('Ask a question')}
                </Button>
              </div>
            </aside>
          </div>

          {related.length ? (
            <div className="mt-16">
              <h2 className="display-md">{t('Related roles')}</h2>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {related.map((item) => (
                  <JobCard key={item.id} job={item} />
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    </>
  )
}
