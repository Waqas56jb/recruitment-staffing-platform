import { cn } from '../../utils/cn'

export default function LoadingSpinner({ className, label = 'Loading' }) {
  return (
    <div className={cn('inline-flex items-center gap-3 text-sm text-muted', className)} role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
      <span>{label}</span>
    </div>
  )
}
