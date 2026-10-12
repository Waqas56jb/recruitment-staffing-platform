export default function Field({ id, label, error, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}{required ? <span className="text-accent"> *</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? <p className="text-xs text-accent" role="alert">{error}</p> : null}
    </div>
  )
}
