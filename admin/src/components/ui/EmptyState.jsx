import Button from './Button'
export default function EmptyState({ title = 'Nothing here yet', description, actionLabel, actionTo, onAction }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-cream/50 px-6 py-14 text-center">
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p> : null}
      {actionLabel && (actionTo || onAction) ? (
        <div className="mt-6">
          {actionTo ? <Button to={actionTo}>{actionLabel}</Button> : <Button onClick={onAction}>{actionLabel}</Button>}
        </div>
      ) : null}
    </div>
  )
}
