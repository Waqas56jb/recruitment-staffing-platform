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
  const { t } = useI18n()
  const { state, updateTimesheet } = useData()
  const { push } = useToast()
  const timesheet = state.timesheets.find((ts) => ts.id === id && ts.companyId === state.companyId)
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  if (!timesheet) return <EmptyState title={t('Timesheet not found')} actionLabel={t('Back')} actionTo="/timesheets" />
  const worker = state.workers.find((w) => w.id === timesheet.workerId)
  const canReview = timesheet.status === 'Submitted'

  return (
    <div>
      <PageHeader
        title={t('Week ending {date}', { date: formatDate(timesheet.weekEnding) })}
        description={worker?.displayName || t('Worker')}
        breadcrumbs={[{ label: t('Timesheets'), to: '/timesheets' }, { label: formatDate(timesheet.weekEnding) }]}
        actions={canReview ? (
          <>
            <Button variant="outline" onClick={() => setConfirmApprove(true)}>{t('Approve')}</Button>
            <Button variant="danger" onClick={() => { setReason(''); setReasonError(''); setConfirmReject(true) }}>{t('Reject')}</Button>
          </>
        ) : null}
      />
      <div className="mb-4"><Badge tone={statusTone(timesheet.status)}>{t(timesheet.status)}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p><strong>{t('Regular hours:')}</strong> {timesheet.regularHours}</p>
          <p><strong>{t('Overtime:')}</strong> {timesheet.overtimeHours}</p>
          <p><strong>{t('Breaks:')}</strong> {timesheet.breakHours}</p>
          <p><strong>{t('Total:')}</strong> {timesheet.totalHours}</p>
          <p><strong>{t('Submitted:')}</strong> {formatDateTime(timesheet.submittedAt)}</p>
          {timesheet.reviewedAt ? <p><strong>{t('Reviewed:')}</strong> {formatDateTime(timesheet.reviewedAt)}</p> : null}
          {timesheet.rejectionReason ? <p className="text-accent"><strong>{t('Rejection reason:')}</strong> {timesheet.rejectionReason}</p> : null}
        </Card>
        <Card className="text-sm text-muted">
          {t('Approvals and rejections are saved on the timesheet.')}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmApprove}
        title={t('Approve timesheet?')}
        message={t('This marks the timesheet approved.')}
        confirmLabel={t('Approve')}
        onClose={() => setConfirmApprove(false)}
        onConfirm={() => {
          updateTimesheet(timesheet.id, { status: 'Approved', reviewedAt: new Date().toISOString(), rejectionReason: '' })
          push({ title: t('Timesheet approved'), message: t('The status is saved.') })
          setConfirmApprove(false)
        }}
      />

      <ConfirmDialog
        open={confirmReject}
        title={t('Reject timesheet?')}
        message={t('Provide a reason. The timesheet will be marked rejected.')}
        confirmLabel={t('Reject')}
        tone="danger"
        onClose={() => setConfirmReject(false)}
        onConfirm={() => {
          const err = required(reason, 'Rejection reason is required')
          setReasonError(err || '')
          if (err) return
          updateTimesheet(timesheet.id, { status: 'Rejected', reviewedAt: new Date().toISOString(), rejectionReason: reason.trim() })
          push({ title: t('Timesheet rejected'), message: t('The reason is saved on the timesheet.') })
          setConfirmReject(false)
        }}
      >
        <Field id="reason" label={t('Rejection reason')} required error={t(reasonError)} className="mt-4">
          <textarea id="reason" className="input-field" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </ConfirmDialog>
    </div>
  )
}
