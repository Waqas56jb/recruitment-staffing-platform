import { Link, useParams } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { formatDate } from '../utils/format'

export default function CandidateDetailPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const { state } = useData()
  const candidate = state.candidates.find((c) => c.id === id)
  if (!candidate) return <EmptyState title={t('Candidate not found')} actionLabel={t('Back')} actionTo="/candidates" />
  const apps = state.applications.filter((a) => a.candidateId === id)
  return (
    <div>
      <PageHeader title={candidate.fullName} description={candidate.headline} breadcrumbs={[{ label: t('Candidates'), to: '/candidates' }, { label: candidate.fullName }]} />
      <div className="mb-4 flex flex-wrap gap-2"><Badge tone="gold">{t(candidate.status)}</Badge><Badge tone="cream">{t(candidate.availability)}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p className="text-muted">{candidate.bio}</p>
          <p><strong>{t('Email:')}</strong> {candidate.email}</p>
          <p><strong>{t('Phone:')}</strong> {candidate.phone}</p>
          <p><strong>{t('Skills:')}</strong> {candidate.skills.join(', ')}</p>
          <div>{candidate.experience.map((ex) => (
            <div key={ex.id} className="mt-2 rounded-md border border-line p-3"><p className="font-medium">{ex.title} · {ex.employer}</p><p className="text-xs text-muted">{ex.startDate} – {ex.current ? t('Present') : ex.endDate}</p></div>
          ))}</div>
        </Card>
        <Card className="space-y-2 text-sm">
          <p className="font-display text-sm font-semibold">{t('Applications')}</p>
          {apps.length ? apps.map((a) => {
            const job = state.jobs.find((j) => j.id === a.jobId)
            return <Link key={a.id} className="block text-accent" to="/recruitment">{job?.title} · {t(a.status)}</Link>
          }) : <p className="text-muted">{t('None')}</p>}
          <p className="pt-2 text-xs text-muted">{t('CV:')} {candidate.cvMeta?.fileName || '—'} · {formatDate(candidate.cvMeta?.updatedAt)}</p>
        </Card>
      </div>
    </div>
  )
}
