import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useI18n } from '../../i18n'

export default function Accordion({ items = [], className }) {
  const { t } = useI18n()
  const tx = (value) => (typeof value === 'string' ? t(value) : value)
  const baseId = useId()
  const [openId, setOpenId] = useState(items[0]?.question ?? null)

  return (
    <div className={cn('overflow-hidden rounded-xl border border-line bg-white', className)}>
      {items.map((item, index) => {
        const isOpen = openId === item.question
        const panelId = `${baseId}-panel-${index}`
        const buttonId = `${baseId}-button-${index}`

        return (
          <div key={item.question} className={cn(index > 0 && 'border-t border-line')}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.question)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
              >
                <span className="text-base font-semibold sm:text-lg">{tx(item.question)}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-muted transition duration-200',
                    isOpen && 'rotate-180 text-accent',
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-4 pb-4 text-sm leading-relaxed text-muted sm:px-5"
            >
              {tx(item.answer)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
