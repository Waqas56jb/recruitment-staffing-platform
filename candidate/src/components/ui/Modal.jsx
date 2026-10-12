import { useEffect } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

export default function Modal({ open, title, children, onClose, footer }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-4 sm:items-center" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close dialog" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-line bg-white shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-ink/5" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 text-sm">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-line px-5 py-4">{footer}</div> : (
          <div className="flex justify-end border-t border-line px-5 py-4">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </div>
  )
}
