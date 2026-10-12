import Button from './Button'
import { useI18n } from '../../i18n'

export default function EmptyState({ title = 'Nothing here yet', description, actionLabel, actionTo, onAction }) {
  const { t } = useI18n()
  const tr = (v) => (typeof v === 'string' ? t(v) : v)
  return (
    <div className="rounded-xl border border-dashed border-line bg-cream/50 px-6 py-14 text-center">
      <h3 className="font-display text-xl font-semibold">{tr(title)}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-muted">{tr(description)}</p> : null}
      {actionLabel && (actionTo || onAction) ? (
        <div className="mt-6">
          {actionTo ? <Button to={actionTo}>{tr(actionLabel)}</Button> : <Button onClick={onAction}>{tr(actionLabel)}</Button>}
        </div>
      ) : null}
    </div>
  )
}
