import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { LANGUAGES, useI18n } from '../../i18n'
import { cn } from '../../utils/cn'

// mode="dropdown" (compact, default) or mode="segmented" (EN | NL | FR row, for roomy menus).
export default function LanguageSwitcher({ className, variant = 'light', mode = 'dropdown', align = 'right' }) {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const dark = variant === 'dark'
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (mode === 'segmented') {
    return (
      <div
        role="group"
        aria-label={t('Language')}
        className={cn(
          'inline-flex items-center gap-1 rounded-lg border p-1',
          dark ? 'border-white/25 bg-white/5' : 'border-line bg-white',
          className,
        )}
      >
        <Globe className={cn('mx-1.5 h-4 w-4 shrink-0', dark ? 'text-white/70' : 'text-muted')} aria-hidden="true" />
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            aria-pressed={lang === l.code}
            onClick={() => setLang(l.code)}
            className={cn(
              'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition',
              lang === l.code
                ? dark ? 'bg-white text-ink' : 'bg-ink text-white'
                : dark ? 'text-white/80 hover:bg-white/10' : 'text-muted hover:bg-cream hover:text-ink',
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('Language')}: ${current.label}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-sm font-semibold transition',
          dark ? 'border-white/30 text-white hover:bg-white/10' : 'border-line bg-white text-ink hover:bg-cream',
        )}
      >
        <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{current.short}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={t('Language')}
          className={cn(
            'absolute top-full z-50 mt-2 min-w-[11rem] overflow-hidden rounded-lg border border-line bg-white py-1 text-ink shadow-lg',
            align === 'left' ? 'left-0' : 'right-0',
          )}
        >
          {LANGUAGES.map((l) => (
            <li key={l.code} role="option" aria-selected={lang === l.code}>
              <button
                type="button"
                lang={l.code}
                onClick={() => { setLang(l.code); setOpen(false) }}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-cream',
                  lang === l.code ? 'font-semibold' : 'font-medium',
                )}
              >
                <span className="w-6 text-xs font-bold text-muted">{l.short}</span>
                <span className="flex-1 whitespace-nowrap">{l.label}</span>
                {lang === l.code ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
