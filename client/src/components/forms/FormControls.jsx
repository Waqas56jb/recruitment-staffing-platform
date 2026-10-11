import { cn } from '../../utils/cn'

export function FormInput({ id, error, className, ...props }) {
  return (
    <input
      id={id}
      aria-invalid={Boolean(error)}
      className={cn('input-field', className)}
      {...props}
    />
  )
}

export function FormTextarea({ id, error, className, rows = 4, ...props }) {
  return (
    <textarea
      id={id}
      rows={rows}
      aria-invalid={Boolean(error)}
      className={cn('input-field resize-y', className)}
      {...props}
    />
  )
}

export function FormSelect({ id, error, className, children, ...props }) {
  return (
    <select
      id={id}
      aria-invalid={Boolean(error)}
      className={cn('input-field', className)}
      {...props}
    >
      {children}
    </select>
  )
}

export function FormCheckbox({ id, label, error, ...props }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-start gap-3 text-sm text-ink">
        <input
          id={id}
          type="checkbox"
          aria-invalid={Boolean(error)}
          className="mt-1 h-4 w-4 rounded border-line text-accent focus:ring-accent"
          {...props}
        />
        <span>{label}</span>
      </label>
      {error ? (
        <p className="text-xs text-accent" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
