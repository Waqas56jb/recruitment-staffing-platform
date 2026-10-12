import { cn } from '../../utils/cn'
import { useI18n } from '../../i18n'

export default function Badge({ children, tone = 'ink', className }) {
  const { t } = useI18n()
  const tones = {
    ink: 'bg-ink text-white',
    accent: 'bg-accent/10 text-accent',
    gold: 'bg-amber-50 text-amber-800',
    cream: 'bg-cream text-ink',
    soft: 'bg-white/15 text-white backdrop-blur',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {typeof children === 'string' ? t(children) : children}
    </span>
  )
}
