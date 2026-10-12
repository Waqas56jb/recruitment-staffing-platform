import { ArrowRight, Briefcase, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import { formatDate } from '../../utils/format'
import { useI18n } from '../../i18n'

export default function JobCard({ job }) {
  const { t } = useI18n()
  return (
    <article className="card-shell card-interactive flex h-full flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {job.isSample ? <Badge tone="gold">{t('Sample')}</Badge> : null}
        <Badge tone="cream">{t(job.employmentType)}</Badge>
        {job.category ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Briefcase className="h-3.5 w-3.5" aria-hidden />
            {t(job.category)}
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug sm:text-xl">
        <Link to={`/jobs/${job.id}`} className="hover:text-accent">
          {t(job.title)}
        </Link>
      </h3>

      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
        <MapPin className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">{t(job.location)}</span>
      </p>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{t(job.summary)}</p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-xs text-muted sm:text-sm">{formatDate(job.postedAt)}</span>
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
        >
          {t('View role')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
