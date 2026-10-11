import { cn } from '../../utils/cn'

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
  className,
  children,
}) {
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
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          'display-lg',
          tone === 'dark' ? 'text-white' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-3 prose-muted',
            tone === 'dark' ? 'text-white/75' : 'text-muted',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      ) : null}
      {children}
    </div>
  )
}
