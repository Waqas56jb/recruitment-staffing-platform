import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))), '../..')
const write = (f, c) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, c) }

const shells = {
  employee: {
    title: 'Employer Portal',
    nav: [
      ['Dashboard', '/dashboard', 'LayoutDashboard'],
      ['Staffing Requests', '/staffing-requests', 'ClipboardList'],
      ['Candidates', '/candidates', 'Users'],
      ['Placements', '/placements', 'Briefcase'],
      ['Workforce', '/workforce', 'HardHat'],
      ['Timesheets', '/timesheets', 'Clock3'],
      ['Documents', '/documents', 'FileText'],
      ['Invoices', '/invoices', 'Receipt'],
      ['Reports', '/reports', 'BarChart3'],
      ['Company', '/company', 'Building2'],
      ['Team', '/team', 'UserCog'],
      ['Settings', '/settings', 'Settings'],
    ],
  },
  candidate: {
    title: 'Candidate Portal',
    nav: [
      ['Dashboard', '/dashboard', 'LayoutDashboard'],
      ['Find Jobs', '/jobs', 'Search'],
      ['Applications', '/applications', 'Send'],
      ['Saved Jobs', '/saved-jobs', 'Bookmark'],
      ['Profile', '/profile', 'User'],
      ['Documents', '/documents', 'FileText'],
      ['Interviews', '/interviews', 'CalendarDays'],
      ['Notifications', '/notifications', 'Bell'],
      ['Settings', '/settings', 'Settings'],
    ],
  },
  admin: {
    title: 'Admin Console',
    nav: [
      ['Dashboard', '/dashboard', 'LayoutDashboard'],
      ['Companies', '/companies', 'Building2'],
      ['Candidates', '/candidates', 'Users'],
      ['Staffing Requests', '/staffing-requests', 'ClipboardList'],
      ['Jobs', '/jobs', 'Briefcase'],
      ['Recruitment', '/recruitment', 'Kanban'],
      ['Interviews', '/interviews', 'CalendarDays'],
      ['Placements', '/placements', 'BadgeCheck'],
      ['Workforce', '/workforce', 'HardHat'],
      ['Timesheets', '/timesheets', 'Clock3'],
      ['Documents', '/documents', 'FileText'],
      ['Payroll', '/payroll', 'Wallet'],
      ['Invoices', '/invoices', 'Receipt'],
      ['Reports', '/reports', 'BarChart3'],
      ['Notifications', '/notifications', 'Bell'],
      ['Users', '/users', 'UserCog'],
      ['Roles', '/roles', 'Shield'],
      ['Audit Log', '/audit-log', 'ScrollText'],
      ['Settings', '/settings', 'Settings'],
    ],
  },
}

for (const [app, cfg] of Object.entries(shells)) {
  const icons = [...new Set(cfg.nav.map((n) => n[2]))].join(', ')
  const items = cfg.nav.map(([label, to, icon]) => `  { label: '${label}', to: '${to}', icon: ${icon} },`).join('\n')

  write(path.join(root, app, 'src/components/layout/AppShell.jsx'), `import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, X, ${icons} } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { cn } from '../../utils/cn'
import Button from '../ui/Button'

const nav = [
${items}
]

export default function AppShell() {
  const { user, signOut } = useAuth()
  const { state, markNotificationRead } = useData()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  const notes = useMemo(() => {
    return state.notifications.filter((n) => {
      if ('${app}' === 'employee') return n.audience === 'employer:' + (user?.companyId || state.companyId)
      if ('${app}' === 'candidate') return n.audience === 'candidate:' + (user?.candidateId || state.candidateProfileId)
      return n.audience === 'admin' || n.audience.startsWith('employer:') || n.audience.startsWith('candidate:')
    }).slice(0, 8)
  }, [state.notifications, state.companyId, state.candidateProfileId, user])

  const unread = notes.filter((n) => !n.read).length

  const NavItems = ({ onNavigate }) => (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Primary">
      {nav.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 font-display text-sm font-bold uppercase tracking-[0.12em] transition',
              isActive ? 'bg-cream text-ink' : 'text-cream/70 hover:bg-white/10 hover:text-cream',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-ink text-cream transition lg:static lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-16 items-center justify-between border-b border-cream/10 px-5">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream font-display text-lg font-extrabold text-ink">S</span>
            <div>
              <p className="font-display text-lg font-extrabold uppercase tracking-wide">Staffora</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-cream/50">${cfg.title}</p>
            </div>
          </Link>
          <button type="button" className="rounded p-1 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <NavItems onNavigate={() => setOpen(false)} />
        <div className="border-t border-cream/10 p-4 text-xs text-cream/50">
          Demo session · no live backend
        </div>
      </aside>

      {open ? <button type="button" className="fixed inset-0 z-30 bg-ink/40 lg:hidden" aria-label="Close overlay" onClick={() => setOpen(false)} /> : null}

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="border-b border-gold/40 bg-ink px-4 py-2 text-center text-xs text-cream/80">
          Demonstration portal — interactions are local only and are not sent to a server.
        </div>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-cream/90 px-4 backdrop-blur sm:px-6">
          <button type="button" className="rounded-md border border-line p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden text-sm text-muted sm:block">Signed in as <strong className="text-ink">{user?.name}</strong> · {user?.role}</div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button type="button" className="relative rounded-md border border-line bg-white p-2" onClick={() => setShowNotes((v) => !v)} aria-label="Notifications">
                <Bell className="h-4 w-4" />
                {unread ? <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-white">{unread}</span> : null}
              </button>
              {showNotes ? (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-line bg-white p-3 shadow-lift">
                  <p className="font-display text-xs font-bold uppercase tracking-wide">Notifications</p>
                  <div className="mt-2 max-h-72 space-y-2 overflow-y-auto">
                    {notes.length ? notes.map((n) => (
                      <button key={n.id} type="button" className={cn('w-full rounded-md border px-3 py-2 text-left text-sm', n.read ? 'border-line bg-paper' : 'border-accent/20 bg-cream')} onClick={() => { markNotificationRead(n.id); setShowNotes(false); if (n.href) navigate(n.href) }}>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-xs text-muted">{n.body}</p>
                      </button>
                    )) : <p className="text-sm text-muted">No notifications</p>}
                  </div>
                </div>
              ) : null}
            </div>
            <Button variant="outline" size="sm" onClick={() => { signOut(); navigate('/login') }}>
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
`)
}

console.log('App shells written')
