import { useI18n } from '../../i18n'
export default function PageHeader({ title, description, actions, breadcrumbs = [] }) {
  const { t } = useI18n()
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbs.length ? (
          <nav className="mb-2 flex flex-wrap gap-2 text-xs text-muted" aria-label={t('Breadcrumb')}>
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label} className="inline-flex items-center gap-2">
                {i > 0 ? <span>/</span> : null}
                {crumb.to ? <a href={crumb.to} className="hover:text-ink">{t(crumb.label)}</a> : <span className="text-ink">{t(crumb.label)}</span>}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="display-md">{typeof title === 'string' ? t(title) : title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted">{typeof description === 'string' ? t(description) : description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
