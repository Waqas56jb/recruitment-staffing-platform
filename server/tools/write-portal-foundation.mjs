import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))), '../..')
const apps = [
  { name: 'employee', port: 5174, title: 'Staffora Employer Portal', accentLabel: 'Employer' },
  { name: 'candidate', port: 5175, title: 'Staffora Candidate Portal', accentLabel: 'Candidate' },
  { name: 'admin', port: 5176, title: 'Staffora Admin Console', accentLabel: 'Admin' },
]

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

const css = `@import "tailwindcss";

@theme {
  --font-display: "Barlow Condensed", Impact, "Arial Narrow", sans-serif;
  --font-sans: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --color-ink: #0b0b0c;
  --color-ink-soft: #1a1a1c;
  --color-cream: #ebe9e3;
  --color-cream-dark: #dad7ce;
  --color-paper: #f7f6f2;
  --color-accent: #c8102e;
  --color-accent-hover: #a50d25;
  --color-gold: #c9a14a;
  --color-gold-soft: #e4c98a;
  --color-muted: #55555d;
  --color-muted-light: #8a8a93;
  --color-line: rgb(11 11 12 / 0.12);
  --color-line-light: rgb(255 255 255 / 0.14);
  --color-success: #0e7c47;
  --color-warning: #a15c00;
  --shadow-soft: 0 12px 40px rgb(11 11 12 / 0.08);
  --shadow-lift: 0 18px 50px rgb(11 11 12 / 0.14);
}

@layer base {
  html { scroll-behavior: smooth; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  body {
    @apply bg-paper font-sans text-ink antialiased;
  }
  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@layer components {
  .display-md {
    @apply font-display font-bold uppercase leading-none tracking-[-0.01em];
    font-size: clamp(1.35rem, 2.2vw, 1.85rem);
  }
  .eyebrow {
    @apply font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent;
  }
  .input-field {
    @apply w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink
      placeholder:text-muted-light focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10;
  }
  .input-field[aria-invalid="true"] {
    @apply border-accent ring-2 ring-accent/15;
  }
  .card-panel {
    @apply rounded-xl border border-line bg-white shadow-soft;
  }
  .table-wrap {
    @apply overflow-x-auto rounded-xl border border-line bg-white;
  }
}
`

const utils = {
  'src/utils/cn.js': `export function cn(...parts) {\n  return parts.filter(Boolean).join(' ')\n}\n`,
  'src/utils/format.js': `export function formatDate(value) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
  } catch { return String(value) }
}

export function formatDateTime(value) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(value))
  } catch { return String(value) }
}

export function formatMoney(amount, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(amount) || 0)
}

export function uid(prefix = 'id') {
  return prefix + '-' + Math.random().toString(36).slice(2, 9)
}
`,
  'src/utils/validation.js': `const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
export function required(v, msg = 'Required') {
  if (v === undefined || v === null) return msg
  if (typeof v === 'string' && !v.trim()) return msg
  if (typeof v === 'boolean' && v !== true) return msg
  return ''
}
export function email(v, msg = 'Enter a valid email') {
  if (!v) return ''
  return EMAIL_RE.test(String(v).trim()) ? '' : msg
}
export function positiveNumber(v, msg = 'Enter a valid number') {
  if (v === '' || v === undefined || v === null) return msg
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? '' : msg
}
export const CV_ACCEPT = ['.pdf', '.doc', '.docx']
export const CV_MAX = 5 * 1024 * 1024
export function validateCvMeta(file) {
  if (!file) return ''
  const name = file.name.toLowerCase()
  if (!CV_ACCEPT.some((ext) => name.endsWith(ext))) return 'Use PDF or Word (.pdf, .doc, .docx)'
  if (file.size > CV_MAX) return 'File must be 5MB or smaller'
  return ''
}
`,
}

const uiFiles = {
  'src/components/ui/Button.jsx': `import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-ink text-cream hover:bg-ink-soft',
  outline: 'border border-line bg-white hover:bg-cream',
  ghost: 'bg-transparent hover:bg-ink/5',
  danger: 'bg-accent text-white hover:bg-accent-hover',
}
const sizes = {
  sm: 'px-3 py-1.5 text-xs tracking-[0.14em]',
  md: 'px-4 py-2.5 text-xs tracking-[0.16em]',
  lg: 'px-5 py-3 text-sm tracking-[0.16em]',
}

export default function Button({ as, to, href, variant = 'primary', size = 'md', className, children, type = 'button', ...props }) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-display font-bold uppercase transition disabled:opacity-50',
    variants[variant], sizes[size], className,
  )
  if (to) return <Link to={to} className={classes} {...props}>{children}</Link>
  if (href || as === 'a') return <a href={href} className={classes} {...props}>{children}</a>
  return <button type={type} className={classes} {...props}>{children}</button>
}
`,
  'src/components/ui/Badge.jsx': `import { cn } from '../../utils/cn'

const tones = {
  ink: 'bg-ink text-cream',
  accent: 'bg-accent text-white',
  gold: 'bg-gold text-ink',
  cream: 'bg-cream text-ink',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  muted: 'bg-ink/5 text-muted',
}

export default function Badge({ children, tone = 'muted', className }) {
  return (
    <span className={cn('inline-flex items-center rounded-sm px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.14em]', tones[tone] || tones.muted, className)}>
      {children}
    </span>
  )
}

export function statusTone(status = '') {
  const s = status.toLowerCase()
  if (['approved', 'paid', 'filled', 'hired', 'active', 'published', 'completed', 'confirmed', 'assigned'].some((k) => s.includes(k))) return 'success'
  if (['rejected', 'cancelled', 'overdue', 'withdrawn'].some((k) => s.includes(k))) return 'accent'
  if (['draft', 'pending', 'submitted', 'under review', 'interview', 'expiring'].some((k) => s.includes(k))) return 'warning'
  if (['shortlisted', 'sourcing', 'issued'].some((k) => s.includes(k))) return 'gold'
  return 'muted'
}
`,
  'src/components/ui/Card.jsx': `import { cn } from '../../utils/cn'
export default function Card({ className, children }) {
  return <div className={cn('card-panel p-5', className)}>{children}</div>
}
`,
  'src/components/ui/StatCard.jsx': `import Card from './Card'
export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{label}</p>
          <p className="mt-3 font-display text-3xl font-extrabold tracking-tight">{value}</p>
          {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
        </div>
        {Icon ? <span className="rounded-md bg-ink/5 p-2 text-ink"><Icon className="h-5 w-5" /></span> : null}
      </div>
    </Card>
  )
}
`,
  'src/components/ui/PageHeader.jsx': `export default function PageHeader({ title, description, actions, breadcrumbs = [] }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbs.length ? (
          <nav className="mb-2 flex flex-wrap gap-2 text-xs text-muted" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label} className="inline-flex items-center gap-2">
                {i > 0 ? <span>/</span> : null}
                {crumb.to ? <a href={crumb.to} className="hover:text-ink">{crumb.label}</a> : <span className="text-ink">{crumb.label}</span>}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="display-md">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
`,
  'src/components/ui/EmptyState.jsx': `import Button from './Button'
export default function EmptyState({ title = 'Nothing here yet', description, actionLabel, actionTo, onAction }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-cream/50 px-6 py-14 text-center">
      <h3 className="font-display text-xl font-bold uppercase">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p> : null}
      {actionLabel && (actionTo || onAction) ? (
        <div className="mt-6">
          {actionTo ? <Button to={actionTo}>{actionLabel}</Button> : <Button onClick={onAction}>{actionLabel}</Button>}
        </div>
      ) : null}
    </div>
  )
}
`,
  'src/components/ui/LoadingState.jsx': `export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 py-10 text-sm text-muted" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/15 border-t-accent" />
      {label}
    </div>
  )
}
`,
  'src/components/ui/Modal.jsx': `import { useEffect } from 'react'
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
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">{title}</h2>
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
`,
  'src/components/ui/ConfirmDialog.jsx': `import Button from './Button'
import Modal from './Modal'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', tone = 'primary', onConfirm, onClose, loading }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-muted">{message}</p>
    </Modal>
  )
}
`,
  'src/components/ui/Toast.jsx': `import { createContext, useCallback, useContext, useMemo, useState } from 'react'
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
                {toast.title ? <p className="font-display text-xs font-bold uppercase tracking-wide">{toast.title}</p> : null}
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
`,
  'src/components/ui/Pagination.jsx': `import Button from './Button'

export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
      <p>Page {page} of {pages} · {total} items</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</Button>
      </div>
    </div>
  )
}
`,
  'src/components/ui/DataTable.jsx': `import EmptyState from './EmptyState'

export default function DataTable({ columns, rows, rowKey = 'id', emptyTitle = 'No records', emptyDescription }) {
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} />
  return (
    <div className="table-wrap">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-cream/70 text-xs uppercase tracking-wide text-muted">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-display font-bold">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-t border-line hover:bg-paper/80">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-top">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
`,
  'src/components/ui/Field.jsx': `export default function Field({ id, label, error, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}{required ? <span className="text-accent"> *</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? <p className="text-xs text-accent" role="alert">{error}</p> : null}
    </div>
  )
}
`,
}

for (const app of apps) {
  const base = path.join(root, app.name)

  write(path.join(base, 'vite.config.js'), `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../server/shared'),
    },
  },
  server: { port: ${app.port}, strictPort: true },
})
`)

  write(path.join(base, 'index.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0b0b0c" />
    <title>${app.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`)

  write(path.join(base, 'public/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#0b0b0c"/><path d="M18 42V22h8.4c5.2 0 8.6 2.8 8.6 7.1 0 2.8-1.5 5-4 6.1l5.2 6.8H31l-4.5-6H24v6H18zm6-10.4h2.1c2.2 0 3.5-1.1 3.5-2.9s-1.3-2.8-3.5-2.8H24v5.7z" fill="#ebe9e3"/><rect x="14" y="46" width="36" height="3" rx="1.5" fill="#c8102e"/></svg>`)

  write(path.join(base, 'src/styles/index.css'), css)

  for (const [rel, content] of Object.entries(utils)) write(path.join(base, rel), content)
  for (const [rel, content] of Object.entries(uiFiles)) write(path.join(base, rel), content)

  // clone seed into each app for offline independence + keep shared import option
  const seedSrc = path.join(root, 'server/shared/fixtures/seed.js')
  write(path.join(base, 'src/mock/seed.js'), fs.readFileSync(seedSrc, 'utf8'))

  write(path.join(base, 'src/main.jsx'), `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
`)

  const pkg = JSON.parse(fs.readFileSync(path.join(base, 'package.json'), 'utf8'))
  pkg.name = `staffora-${app.name}`
  pkg.version = '1.0.0'
  pkg.description = app.title
  fs.writeFileSync(path.join(base, 'package.json'), JSON.stringify(pkg, null, 2))

  console.log('Foundation written for', app.name)
}

console.log('Portal foundations ready.')
