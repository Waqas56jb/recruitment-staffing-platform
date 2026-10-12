import { useI18n } from '../../i18n'

export default function Field({ id, label, error, hint, required, children }) {
  const { t } = useI18n()
  const tr = (v) => (typeof v === 'string' ? t(v) : v)
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {tr(label)}{required ? <span className="text-accent"> *</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-muted">{tr(hint)}</p> : null}
      {error ? <p className="text-xs text-accent" role="alert">{tr(error)}</p> : null}
    </div>
  )
}
