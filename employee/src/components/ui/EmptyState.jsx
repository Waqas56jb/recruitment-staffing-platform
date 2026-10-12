import { useI18n } from '../../i18n'
import Button from './Button'
export default function EmptyState({ title = 'Nothing here yet', description, actionLabel, actionTo, onAction }) {
  const { t } = useI18n()
  const label = typeof actionLabel === 'string' ? t(actionLabel) : actionLabel
  return (
    <div className="rounded-xl border border-dashed border-line bg-cream/50 px-6 py-14 text-center">
      <h3 className="font-display text-xl font-semibold">{typeof title === 'string' ? t(title) : title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-muted">{typeof description === 'string' ? t(description) : description}</p> : null}
      {actionLabel && (actionTo || onAction) ? (
        <div className="mt-6">
          {actionTo ? <Button to={actionTo}>{label}</Button> : <Button onClick={onAction}>{label}</Button>}
        </div>
      ) : null}
    </div>
  )
}
