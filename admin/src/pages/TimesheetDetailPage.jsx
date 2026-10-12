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
  const timesheet = state.timesheets.find((t) => t.id === id)
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  if (!timesheet) return <EmptyState title="Timesheet not found" actionLabel="Back" actionTo="/timesheets" />
  const worker = state.workers.find((w) => w.id === timesheet.workerId)
  const canReview = timesheet.status === 'Submitted'
  return (
    <div>
      <PageHeader title={`Week ending ${formatDate(timesheet.weekEnding)}`} description={worker?.displayName} breadcrumbs={[{ label: 'Timesheets', to: '/timesheets' }, { label: formatDate(timesheet.weekEnding) }]}
        actions={canReview ? (<><Button variant="outline" onClick={() => setConfirmApprove(true)}>Approve</Button><Button variant="danger" onClick={() => { setReason(''); setReasonError(''); setConfirmReject(true) }}>Reject</Button></>) : null} />
      <div className="mb-4"><Badge tone={statusTone(timesheet.status)}>{timesheet.status}</Badge></div>
      <Card className="space-y-2 text-sm">
        <p><strong>Regular / OT / Breaks:</strong> {timesheet.regularHours} / {timesheet.overtimeHours} / {timesheet.breakHours}</p>
        <p><strong>Total:</strong> {timesheet.totalHours}</p>
        <p><strong>Submitted:</strong> {formatDateTime(timesheet.submittedAt)}</p>
        {timesheet.rejectionReason ? <p className="text-accent"><strong>Reason:</strong> {timesheet.rejectionReason}</p> : null}
        <p className="text-xs text-muted">Approvals are saved on the timesheet.</p>
      </Card>
      <ConfirmDialog open={confirmApprove} title="Approve timesheet?" message="This marks the timesheet approved." confirmLabel="Approve" onClose={() => setConfirmApprove(false)} onConfirm={() => { updateTimesheet(id, { status: 'Approved', reviewedAt: new Date().toISOString(), rejectionReason: '' }); push({ title: 'Approved', message: 'The timesheet is saved.' }); setConfirmApprove(false) }} />
      <ConfirmDialog open={confirmReject} title="Reject timesheet?" message="Provide a reason." confirmLabel="Reject" tone="danger" onClose={() => setConfirmReject(false)} onConfirm={() => { const err = required(reason, 'Reason required'); setReasonError(err || ''); if (err) return; updateTimesheet(id, { status: 'Rejected', reviewedAt: new Date().toISOString(), rejectionReason: reason.trim() }); push({ title: 'Rejected', message: 'The reason is saved.' }); setConfirmReject(false) }}>
        <Field id="reason" label="Rejection reason" required error={reasonError} className="mt-4"><textarea id="reason" className="input-field" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </ConfirmDialog>
    </div>
  )
}
