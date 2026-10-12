import { useI18n } from '../../i18n'

export default function LoadingState({ label = 'Loading…' }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-3 py-10 text-sm text-muted" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/15 border-t-accent" />
      {typeof label === 'string' ? t(label) : label}
    </div>
  )
}
