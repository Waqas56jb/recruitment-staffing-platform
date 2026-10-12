import { useI18n } from '../../i18n'
import { cn } from '../../utils/cn'

export default function FormField({
  id,
  label,
  error,
  hint,
  required,
  children,
  className,
}) {
  const { t } = useI18n()
  const tr = (value) => (typeof value === 'string' ? t(value) : value)
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {tr(label)}
        {required ? <span className="text-accent"> *</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-muted">{tr(hint)}</p> : null}
      {error ? (
        <p className="text-xs text-accent" role="alert">
          {tr(error)}
        </p>
      ) : null}
    </div>
  )
}
