import Button from './Button'
import { useI18n } from '../../i18n'

export default function Pagination({ page, pageSize, total, onChange }) {
  const { t } = useI18n()
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
      <p>{t('Page {page} of {pages}', { page, pages })} · {total === 1 ? t('{count} item', { count: total }) : t('{count} items', { count: total })}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>{t('Previous')}</Button>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>{t('Next')}</Button>
      </div>
    </div>
  )
}
