import { Languages } from 'lucide-react'
import { LANGUAGES, useI18n } from '../../i18n'
import { cn } from '../../utils/cn'

export default function LanguageSwitcher({ className, variant = 'light' }) {
  const { lang, setLang, t } = useI18n()
  const dark = variant === 'dark'
  return (
    <div
      role="group"
      aria-label={t('Language')}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md border p-0.5',
        dark ? 'border-white/30' : 'border-line bg-white',
        className,
      )}
    >
      <Languages className={cn('mx-1 h-3.5 w-3.5', dark ? 'text-white/70' : 'text-muted')} aria-hidden="true" />
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          title={l.label}
          aria-pressed={lang === l.code}
          onClick={() => setLang(l.code)}
          className={cn(
            'rounded px-2 py-1 text-xs font-semibold transition',
            lang === l.code
              ? dark ? 'bg-white text-ink' : 'bg-ink text-white'
              : dark ? 'text-white/80 hover:bg-white/10' : 'text-muted hover:bg-cream hover:text-ink',
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}
