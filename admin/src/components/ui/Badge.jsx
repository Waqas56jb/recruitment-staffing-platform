import { cn } from '../../utils/cn'
import { useI18n } from '../../i18n'

const tones = {
  ink: 'bg-ink text-white',
  accent: 'bg-accent/10 text-accent',
  gold: 'bg-amber-50 text-amber-800',
  cream: 'bg-cream text-ink',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  muted: 'bg-cream text-muted',
}

export default function Badge({ children, tone = 'muted', className }) {
  const { t } = useI18n()
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', tones[tone] || tones.muted, className)}>
      {typeof children === 'string' ? t(children) : children}
    </span>
  )
}

export function statusTone(status = '') {
  const s = status.toLowerCase()
  if (['approved', 'paid', 'filled', 'hired', 'active', 'published', 'completed', 'confirmed', 'assigned'].some((k) => s.includes(k))) return 'success'
  if (['rejected', 'cancelled', 'overdue', 'withdrawn'].some((k) => s.includes(k))) return 'accent'
  if (['draft', 'pending', 'submitted', 'under review', 'interview', 'expiring'].some((k) => s.includes(k))) return 'warning'
  if (['shortlisted', 'sourcing', 'issued'].some((k) => s.includes(k))) return 'gold'
  return 'muted'
}
