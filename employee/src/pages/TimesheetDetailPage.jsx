import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { formatDate, formatDateTime } from '../utils/format'
import { required } from '../utils/validation'

export default function TimesheetDetailPage() {
  const { id } = useParams()
  const { state, updateTimesheet } = useData()
  const { push } = useToast()
  const timesheet = state.timesheets.find((t) => t.id === id && t.companyId === state.companyId)
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  if (!timesheet) return <EmptyState title="Timesheet not found" actionLabel="Back" actionTo="/timesheets" />
  const worker = state.workers.find((w) => w.id === timesheet.workerId)
  const canReview = timesheet.status === 'Submitted'

  return (
    <div>
      <PageHeader
        title={`Week ending ${formatDate(timesheet.weekEnding)}`}
        description={worker?.displayName || 'Worker'}
        breadcrumbs={[{ label: 'Timesheets', to: '/timesheets' }, { label: formatDate(timesheet.weekEnding) }]}
        actions={canReview ? (
          <>
            <Button variant="outline" onClick={() => setConfirmApprove(true)}>Approve</Button>
            <Button variant="danger" onClick={() => { setReason(''); setReasonError(''); setConfirmReject(true) }}>Reject</Button>
          </>
        ) : null}
      />
      <div className="mb-4"><Badge tone={statusTone(timesheet.status)}>{timesheet.status}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p><strong>Regular hours:</strong> {timesheet.regularHours}</p>
          <p><strong>Overtime:</strong> {timesheet.overtimeHours}</p>
          <p><strong>Breaks:</strong> {timesheet.breakHours}</p>
          <p><strong>Total:</strong> {timesheet.totalHours}</p>
          <p><strong>Submitted:</strong> {formatDateTime(timesheet.submittedAt)}</p>
          {timesheet.reviewedAt ? <p><strong>Reviewed:</strong> {formatDateTime(timesheet.reviewedAt)}</p> : null}
          {timesheet.rejectionReason ? <p className="text-accent"><strong>Rejection reason:</strong> {timesheet.rejectionReason}</p> : null}
        </Card>
        <Card className="text-sm text-muted">
          Approvals and rejections are saved on the timesheet.
        </Card>
      </div>

      <ConfirmDialog
        open={confirmApprove}
        title="Approve timesheet?"
        message="This marks the timesheet approved."
        confirmLabel="Approve"
        onClose={() => setConfirmApprove(false)}
        onConfirm={() => {
          updateTimesheet(timesheet.id, { status: 'Approved', reviewedAt: new Date().toISOString(), rejectionReason: '' })
          push({ title: 'Timesheet approved', message: 'The status is saved.' })
          setConfirmApprove(false)
        }}
      />

      <ConfirmDialog
        open={confirmReject}
        title="Reject timesheet?"
        message="Provide a reason. The timesheet will be marked rejected."
        confirmLabel="Reject"
        tone="danger"
        onClose={() => setConfirmReject(false)}
        onConfirm={() => {
          const err = required(reason, 'Rejection reason is required')
          setReasonError(err || '')
          if (err) return
          updateTimesheet(timesheet.id, { status: 'Rejected', reviewedAt: new Date().toISOString(), rejectionReason: reason.trim() })
          push({ title: 'Timesheet rejected', message: 'The reason is saved on the timesheet.' })
          setConfirmReject(false)
        }}
      >
        <Field id="reason" label="Rejection reason" required error={reasonError} className="mt-4">
          <textarea id="reason" className="input-field" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </ConfirmDialog>
    </div>
  )
}
