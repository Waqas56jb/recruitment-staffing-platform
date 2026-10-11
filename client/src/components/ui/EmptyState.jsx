import Button from './Button'

export default function EmptyState({
  title = 'No results found',
  description = 'Try adjusting your filters or search terms.',
  actionLabel,
  actionTo,
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-paper px-6 py-16 text-center">
      <h3 className="display-md">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-muted">{description}</p>
      {actionLabel && actionTo ? (
        <div className="mt-8">
          <Button to={actionTo} variant="dark">
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
