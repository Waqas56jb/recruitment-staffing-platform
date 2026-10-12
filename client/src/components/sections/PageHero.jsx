import { motion } from 'framer-motion'
import OptimizedImage from '../ui/OptimizedImage'
import Container from '../ui/Container'
import { cn } from '../../utils/cn'
import { useI18n } from '../../i18n'

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  actions,
  compact = false,
  align = 'left',
}) {
  const { t } = useI18n()
  const tx = (value) => (typeof value === 'string' ? t(value) : value)
  return (
    <section
      className={cn(
        'relative overflow-hidden bg-ink text-white',
        compact ? 'min-h-[38svh] sm:min-h-[44vh]' : 'min-h-[48svh] sm:min-h-[56vh] lg:min-h-[62vh]',
      )}
    >
      {image ? (
        <>
          <OptimizedImage
            src={image.src}
            alt={tx(image.alt)}
            priority
            className="absolute inset-0"
            imgClassName="opacity-55"
            objectPosition={image.position || 'center'}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
        </>
      ) : null}

      <Container
        className={cn(
          'relative flex flex-col justify-end pb-10 pt-24 sm:pb-14 sm:pt-32 lg:pb-16',
          compact ? 'min-h-[38svh] sm:min-h-[44vh]' : 'min-h-[48svh] sm:min-h-[56vh] lg:min-h-[62vh]',
          align === 'center' && 'items-center text-center',
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl"
        >
          {eyebrow ? <p className="eyebrow text-gold-soft">{tx(eyebrow)}</p> : null}
          <h1 className="display-xl mt-3 sm:mt-4">{tx(title)}</h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:mt-5 sm:text-base lg:text-lg">
              {tx(description)}
            </p>
          ) : null}
          {actions ? (
            <div className="mt-6 flex flex-col gap-3 xs:flex-row xs:flex-wrap sm:mt-8 [&>a]:w-full [&>button]:w-full xs:[&>a]:w-auto xs:[&>button]:w-auto">
              {actions}
            </div>
          ) : null}
        </motion.div>
      </Container>
    </section>
  )
}
