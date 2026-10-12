import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDateTime } from '../utils/format'
import { useNavigate } from 'react-router-dom'
import { cn } from '../utils/cn'

export default function NotificationsPage() {
  const { state, markNotificationRead, markAllNotificationsRead } = useData()
  const navigate = useNavigate()
  const notes = state.notifications.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return (
    <div>
      <PageHeader title="Notifications" description="Alerts saved for the agency." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Notifications' }]}
        actions={notes.some((n) => !n.read) ? <Button variant="outline" onClick={() => markAllNotificationsRead(() => true)}>Mark all read</Button> : null} />
      {!notes.length ? <EmptyState title="No notifications" /> : (
        <div className="space-y-3">{notes.map((n) => (
          <button key={n.id} type="button" className={cn('w-full rounded-xl border px-4 py-3 text-left', n.read ? 'border-line bg-white' : 'border-accent/20 bg-cream')} onClick={() => { markNotificationRead(n.id); if (n.href) navigate(n.href) }}>
            <p className="text-xs text-muted">{n.audience}</p>
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-muted">{n.body}</p>
            <p className="mt-1 text-xs text-muted">{formatDateTime(n.createdAt)}</p>
          </button>
        ))}</div>
      )}
    </div>
  )
}
