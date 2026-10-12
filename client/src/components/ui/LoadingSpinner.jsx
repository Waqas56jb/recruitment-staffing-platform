import { cn } from '../../utils/cn'
import { useI18n } from '../../i18n'

export default function LoadingSpinner({ className, label = 'Loading' }) {
  const { t } = useI18n()
  return (
    <div className={cn('inline-flex items-center gap-3 text-sm text-muted', className)} role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
      <span>{t(label)}</span>
    </div>
  )
}
