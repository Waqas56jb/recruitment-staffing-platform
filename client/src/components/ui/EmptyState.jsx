import Button from './Button'
import { useI18n } from '../../i18n'

export default function EmptyState({
  title = 'No results found',
  description = 'Try adjusting your filters or search terms.',
  actionLabel,
  actionTo,
}) {
  const { t } = useI18n()
  const tx = (value) => (typeof value === 'string' ? t(value) : value)
  return (
    <div className="rounded-xl border border-dashed border-line bg-paper px-6 py-16 text-center">
      <h3 className="display-md">{tx(title)}</h3>
      <p className="mx-auto mt-3 max-w-md text-muted">{tx(description)}</p>
      {actionLabel && actionTo ? (
        <div className="mt-8">
          <Button to={actionTo} variant="dark">
            {tx(actionLabel)}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
