import { useI18n } from '../../i18n'
export default function Field({ id, label, error, hint, required, children }) {
  const { t } = useI18n()
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {typeof label === 'string' ? t(label) : label}{required ? <span className="text-accent"> *</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-muted">{typeof hint === 'string' ? t(hint) : hint}</p> : null}
      {error ? <p className="text-xs text-accent" role="alert">{typeof error === 'string' ? t(error) : error}</p> : null}
    </div>
  )
}
