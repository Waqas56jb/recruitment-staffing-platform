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
import { useI18n } from '../i18n'
import { formatDate, formatDateTime } from '../utils/format'
import { required } from '../utils/validation'

export default function TimesheetDetailPage() {
  const { id } = useParams()
  const { state, updateTimesheet } = useData()
  const { push } = useToast()
  const { t } = useI18n()
  const timesheet = state.timesheets.find((ts) => ts.id === id)
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  if (!timesheet) return <EmptyState title={t('Timesheet not found')} actionLabel={t('Back')} actionTo="/timesheets" />
  const worker = state.workers.find((w) => w.id === timesheet.workerId)
  const canReview = timesheet.status === 'Submitted'
  return (
    <div>
      <PageHeader title={t('Week ending {date}', { date: formatDate(timesheet.weekEnding) })} description={worker?.displayName} breadcrumbs={[{ label: t('Timesheets'), to: '/timesheets' }, { label: formatDate(timesheet.weekEnding) }]}
        actions={canReview ? (<><Button variant="outline" onClick={() => setConfirmApprove(true)}>{t('Approve')}</Button><Button variant="danger" onClick={() => { setReason(''); setReasonError(''); setConfirmReject(true) }}>{t('Reject')}</Button></>) : null} />
      <div className="mb-4"><Badge tone={statusTone(timesheet.status)}>{t(timesheet.status)}</Badge></div>
      <Card className="space-y-2 text-sm">
        <p><strong>{t('Regular / OT / Breaks:')}</strong> {timesheet.regularHours} / {timesheet.overtimeHours} / {timesheet.breakHours}</p>
        <p><strong>{t('Total:')}</strong> {timesheet.totalHours}</p>
        <p><strong>{t('Submitted:')}</strong> {formatDateTime(timesheet.submittedAt)}</p>
        {timesheet.rejectionReason ? <p className="text-accent"><strong>{t('Reason:')}</strong> {timesheet.rejectionReason}</p> : null}
        <p className="text-xs text-muted">{t('Approvals are saved on the timesheet.')}</p>
      </Card>
      <ConfirmDialog open={confirmApprove} title={t('Approve timesheet?')} message={t('This marks the timesheet approved.')} confirmLabel={t('Approve')} onClose={() => setConfirmApprove(false)} onConfirm={() => { updateTimesheet(id, { status: 'Approved', reviewedAt: new Date().toISOString(), rejectionReason: '' }); push({ title: t('Approved'), message: t('The timesheet is saved.') }); setConfirmApprove(false) }} />
      <ConfirmDialog open={confirmReject} title={t('Reject timesheet?')} message={t('Provide a reason.')} confirmLabel={t('Reject')} tone="danger" onClose={() => setConfirmReject(false)} onConfirm={() => { const err = required(reason, 'Reason required'); setReasonError(err || ''); if (err) return; updateTimesheet(id, { status: 'Rejected', reviewedAt: new Date().toISOString(), rejectionReason: reason.trim() }); push({ title: t('Rejected'), message: t('The reason is saved.') }); setConfirmReject(false) }}>
        <Field id="reason" label={t('Rejection reason')} required error={t(reasonError)} className="mt-4"><textarea id="reason" className="input-field" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </ConfirmDialog>
    </div>
  )
}
