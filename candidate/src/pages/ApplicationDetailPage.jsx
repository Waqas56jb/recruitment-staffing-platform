import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'
import { useI18n } from '../i18n'

export default function ApplicationDetailPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const { state, updateApplication } = useData()
  const { push } = useToast()
  const [confirm, setConfirm] = useState(false)
  const app = state.applications.find((a) => a.id === id && a.candidateId === state.candidateProfileId)
  if (!app) return <EmptyState title={t('Application not found')} actionLabel={t('Back')} actionTo="/applications" />
  const job = state.jobs.find((j) => j.id === app.jobId)

  return (
    <div>
      <PageHeader
        title={job?.title || t('Application')}
        description={t('Status · {status}', { status: t(app.status) })}
        breadcrumbs={[{ label: t('Applications'), to: '/applications' }, { label: job?.title || id }]}
        actions={app.status !== 'Withdrawn' && app.status !== 'Hired' ? (
          <Button variant="danger" onClick={() => setConfirm(true)}>{t('Withdraw')}</Button>
        ) : null}
      />
      <div className="mb-4"><Badge tone={statusTone(app.status)}>{app.status}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p><strong>{t('Applied:')}</strong> {formatDate(app.appliedAt)}</p>
          <p><strong>{t('Availability:')}</strong> {t(app.availability)}</p>
          <p><strong>{t('Experience:')}</strong> {app.experienceSummary || '—'}</p>
          <p className="text-muted">{app.coverLetter}</p>
          {job ? <Link className="text-accent" to={`/jobs/${job.id}`}>{t('View job listing')}</Link> : null}
        </Card>
        <Card className="space-y-3 text-sm">
          <p className="font-display text-sm font-semibold">{t('Timeline')}</p>
          {(app.timeline || []).map((entry, i) => (
            <div key={i} className="rounded-md border border-line px-3 py-2">
              <p className="font-medium">{t(entry.status)}</p>
              <p className="text-xs text-muted">{formatDate(entry.at)} · {t(entry.note)}</p>
            </div>
          ))}
        </Card>
      </div>
      <ConfirmDialog
        open={confirm}
        title={t('Withdraw application?')}
        message={t('This marks the application as withdrawn.')}
        confirmLabel={t('Withdraw')}
        tone="danger"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          updateApplication(app.id, { status: 'Withdrawn', note: 'Withdrawn by candidate (demo)' })
          push({ title: t('Application withdrawn'), message: t('The agency can see the updated status.') })
          setConfirm(false)
        }}
      />
    </div>
  )
}
