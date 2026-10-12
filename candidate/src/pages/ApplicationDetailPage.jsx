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

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const { state, updateApplication } = useData()
  const { push } = useToast()
  const [confirm, setConfirm] = useState(false)
  const app = state.applications.find((a) => a.id === id && a.candidateId === state.candidateProfileId)
  if (!app) return <EmptyState title="Application not found" actionLabel="Back" actionTo="/applications" />
  const job = state.jobs.find((j) => j.id === app.jobId)

  return (
    <div>
      <PageHeader
        title={job?.title || 'Application'}
        description={`Status · ${app.status}`}
        breadcrumbs={[{ label: 'Applications', to: '/applications' }, { label: job?.title || id }]}
        actions={app.status !== 'Withdrawn' && app.status !== 'Hired' ? (
          <Button variant="danger" onClick={() => setConfirm(true)}>Withdraw</Button>
        ) : null}
      />
      <div className="mb-4"><Badge tone={statusTone(app.status)}>{app.status}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p><strong>Applied:</strong> {formatDate(app.appliedAt)}</p>
          <p><strong>Availability:</strong> {app.availability}</p>
          <p><strong>Experience:</strong> {app.experienceSummary || '—'}</p>
          <p className="text-muted">{app.coverLetter}</p>
          {job ? <Link className="text-accent" to={`/jobs/${job.id}`}>View job listing</Link> : null}
        </Card>
        <Card className="space-y-3 text-sm">
          <p className="font-display text-sm font-semibold">Timeline</p>
          {(app.timeline || []).map((t, i) => (
            <div key={i} className="rounded-md border border-line px-3 py-2">
              <p className="font-medium">{t.status}</p>
              <p className="text-xs text-muted">{formatDate(t.at)} · {t.note}</p>
            </div>
          ))}
        </Card>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Withdraw application?"
        message="This marks the application as withdrawn."
        confirmLabel="Withdraw"
        tone="danger"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          updateApplication(app.id, { status: 'Withdrawn', note: 'Withdrawn by candidate (demo)' })
          push({ title: 'Application withdrawn', message: 'The agency can see the updated status.' })
          setConfirm(false)
        }}
      />
    </div>
  )
}
