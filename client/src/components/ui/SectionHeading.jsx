import { cn } from '../../utils/cn'
import { useI18n } from '../../i18n'

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
  className,
  children,
}) {
  const { t } = useI18n()
  const tx = (value) => (typeof value === 'string' ? t(value) : value)
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'eyebrow mb-2',
            tone === 'dark' ? 'text-gold-soft' : 'text-accent',
          )}
        >
          {tx(eyebrow)}
        </p>
      ) : null}
      <h2
        className={cn(
          'display-lg',
          tone === 'dark' ? 'text-white' : 'text-ink',
        )}
      >
        {tx(title)}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-3 prose-muted',
            tone === 'dark' ? 'text-white/75' : 'text-muted',
            align === 'center' && 'mx-auto',
          )}
        >
          {tx(description)}
        </p>
      ) : null}
      {children}
    </div>
  )
}
