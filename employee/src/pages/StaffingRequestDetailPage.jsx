import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { formatDate } from '../utils/format'

export default function StaffingRequestDetailPage() {
  const { id } = useParams()
  const { t } = useI18n()
  const { state, updateStaffingRequest } = useData()
  const request = state.staffingRequests.find((r) => r.id === id && r.companyId === state.companyId)
  const { push } = useToast()
  const navigate = useNavigate()
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (!request) {
    return <EmptyState title={t('Request not found')} actionLabel={t('Back to requests')} actionTo="/staffing-requests" />
  }

  return (
    <div>
      <PageHeader
        title={request.title}
        description={`${request.role} · ${request.location}`}
        breadcrumbs={[{ label: t('Requests'), to: '/staffing-requests' }, { label: request.title }]}
        actions={(
          <>
            <Button to={`/staffing-requests/${request.id}/edit`} variant="outline">{t('Edit')}</Button>
            {request.status !== 'Cancelled' && request.status !== 'Filled' ? (
              <Button variant="danger" onClick={() => setConfirmCancel(true)}>{t('Cancel request')}</Button>
            ) : null}
          </>
        )}
      />
      <div className="mb-4"><Badge tone={statusTone(request.status)}>{t(request.status)}</Badge> <Badge tone="cream">{t('{priority} priority', { priority: t(request.priority) })}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3 text-sm">
          <p><strong>{t('Department:')}</strong> {request.department || '—'}</p>
          <p><strong>{t('Headcount:')}</strong> {request.headcount}</p>
          <p><strong>{t('Employment type:')}</strong> {t(request.employmentType)}</p>
          <p><strong>{t('Start / duration:')}</strong> {formatDate(request.startDate)} · {request.duration || '—'}</p>
          <p><strong>{t('Hours:')}</strong> {request.hours || '—'}</p>
          <p><strong>{t('Pay range:')}</strong> {request.payRange || '—'}</p>
          <p><strong>{t('Skills:')}</strong> {(request.skills || []).join(', ') || '—'}</p>
          <p className="text-muted">{request.description}</p>
          {request.additional ? <p className="text-muted">{request.additional}</p> : null}
        </Card>
        <Card className="space-y-3 text-sm">
          <p className="font-display text-sm font-semibold">{t('Activity')}</p>
          <p>{t('Created {date}', { date: formatDate(request.createdAt) })}</p>
          <p>{t('Updated {date}', { date: formatDate(request.updatedAt) })}</p>
          <Button to="/candidates" variant="outline" className="w-full">{t('Review candidates')}</Button>
          <Link to="/placements" className="block text-center text-xs font-semibold text-accent">{t('View placements')}</Link>
        </Card>
      </div>
      <ConfirmDialog
        open={confirmCancel}
        title={t('Cancel staffing request?')}
        message={t('This marks the request as cancelled.')}
        confirmLabel={t('Cancel request')}
        tone="danger"
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => {
          updateStaffingRequest(request.id, { status: 'Cancelled' })
          push({ title: t('Request cancelled'), message: t('The status is saved.') })
          setConfirmCancel(false)
          navigate('/staffing-requests')
        }}
      />
    </div>
  )
}
