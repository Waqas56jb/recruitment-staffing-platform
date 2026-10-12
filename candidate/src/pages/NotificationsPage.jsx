import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { formatDateTime } from '../utils/format'
import { useNavigate } from 'react-router-dom'
import { cn } from '../utils/cn'

export default function NotificationsPage() {
  const { t } = useI18n()
  const { state, markNotificationRead, markAllNotificationsRead } = useData()
  const navigate = useNavigate()
  const audience = 'candidate:' + state.candidateProfileId
  const notes = state.notifications.filter((n) => n.audience === audience)

  return (
    <div>
      <PageHeader
        title={t('Notifications')}
        description={t('Alerts saved for your account.')}
        breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Notifications') }]}
        actions={notes.some((n) => !n.read) ? (
          <Button variant="outline" onClick={() => markAllNotificationsRead((n) => n.audience === audience)}>{t('Mark all read')}</Button>
        ) : null}
      />
      {!notes.length ? (
        <EmptyState title={t('No notifications')} />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <button
              key={n.id}
              type="button"
              className={cn('w-full rounded-xl border px-4 py-3 text-left', n.read ? 'border-line bg-white' : 'border-accent/20 bg-cream')}
              onClick={() => { markNotificationRead(n.id); if (n.href) navigate(n.href) }}
            >
              <p className="font-medium">{t(n.title)}</p>
              <p className="text-sm text-muted">{t(n.body)}</p>
              <p className="mt-1 text-xs text-muted">{formatDateTime(n.createdAt)}</p>
            </button>
          ))}
        </div>
      )}
      {!notes.length ? null : <Card className="mt-4 text-sm text-muted">{t('Notification delivery (email/SMS/push) is not implemented in this frontend.')}</Card>}
    </div>
  )
}
