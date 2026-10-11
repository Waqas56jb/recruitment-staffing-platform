import OptimizedImage from '../ui/OptimizedImage'
import Container from '../ui/Container'
import { cn } from '../../utils/cn'

export default function CtaBand({
  eyebrow,
  title,
  description,
  actions,
  image,
  tone = 'dark',
}) {
  const dark = tone === 'dark'

  return (
    <section className={cn('relative overflow-hidden', dark ? 'bg-ink text-white' : 'bg-cream text-ink')}>
      {image ? (
        <>
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            className="absolute inset-0"
            imgClassName={dark ? 'opacity-30' : 'opacity-15'}
            sizes="100vw"
          />
          <div
            className={cn(
              'absolute inset-0',
              dark
                ? 'bg-gradient-to-r from-ink via-ink/90 to-ink/70'
                : 'bg-gradient-to-r from-cream via-cream/95 to-cream/80',
            )}
          />
        </>
      ) : null}
      <Container className="relative section-pad">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className={cn('eyebrow mb-2', dark ? 'text-gold-soft' : 'text-accent')}>
              {eyebrow}
            </p>
          ) : null}
          <h2 className="display-lg">{title}</h2>
          {description ? (
            <p
              className={cn(
                'mt-3 text-sm leading-relaxed sm:text-base',
                dark ? 'text-white/75' : 'text-muted',
              )}
            >
              {description}
            </p>
          ) : null}
          {actions ? (
            <div className="mt-6 flex flex-col gap-3 xs:flex-row xs:flex-wrap [&>a]:w-full [&>button]:w-full xs:[&>a]:w-auto xs:[&>button]:w-auto">
              {actions}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
