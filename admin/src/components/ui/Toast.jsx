import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const push = useCallback((toast) => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, ...toast }])
    window.setTimeout(() => dismiss(id), toast.duration ?? 4200)
  }, [dismiss])
  const value = useMemo(() => ({ push, dismiss }), [push, dismiss])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(92vw,22rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={cn('pointer-events-auto rounded-lg border px-4 py-3 shadow-lift', toast.tone === 'error' ? 'border-accent/30 bg-white' : 'border-ink/10 bg-ink text-cream')} role="status">
            <div className="flex gap-3">
              <div className="flex-1">
                {toast.title ? <p className="font-display text-sm font-semibold">{toast.title}</p> : null}
                <p className="mt-1 text-sm opacity-90">{toast.message}</p>
              </div>
              <button type="button" onClick={() => dismiss(toast.id)} className="opacity-70 hover:opacity-100" aria-label="Dismiss"><X className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast requires ToastProvider')
  return ctx
}
