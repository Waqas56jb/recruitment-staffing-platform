import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, X, LayoutDashboard, Search, Send, Bookmark, User, FileText, CalendarDays, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { cn } from '../../utils/cn'
import Button from '../ui/Button'

const nav = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Find Jobs', to: '/jobs', icon: Search },
  { label: 'Applications', to: '/applications', icon: Send },
  { label: 'Saved Jobs', to: '/saved-jobs', icon: Bookmark },
  { label: 'Profile', to: '/profile', icon: User },
  { label: 'Documents', to: '/documents', icon: FileText },
  { label: 'Interviews', to: '/interviews', icon: CalendarDays },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export default function AppShell() {
  const { user, signOut } = useAuth()
  const { state, markNotificationRead } = useData()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  const notes = useMemo(() => {
    return state.notifications.filter((n) => {
      if ('candidate' === 'employee') return n.audience === 'employer:' + (user?.companyId || state.companyId)
      if ('candidate' === 'candidate') return n.audience === 'candidate:' + (user?.candidateId || state.candidateProfileId)
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
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition',
              isActive ? 'bg-white text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white',
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
    <div className="min-h-screen bg-cream lg:flex">
      <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-ink text-white transition lg:static lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link to="/dashboard" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-sm font-bold text-ink">S</span>
            <div>
              <p className="text-lg font-semibold tracking-tight text-white">Staffora</p>
              <p className="text-xs font-medium text-white/60">Candidate Portal</p>
            </div>
          </Link>
          <button type="button" className="rounded p-1 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <NavItems onNavigate={() => setOpen(false)} />
        <div className="border-t border-white/10 p-4 text-xs text-white/60">
          {user?.email}
        </div>
      </aside>

      {open ? <button type="button" className="fixed inset-0 z-30 bg-ink/40 lg:hidden" aria-label="Close overlay" onClick={() => setOpen(false)} /> : null}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-white px-4 sm:px-6">
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
                  <p className="text-sm font-semibold">Notifications</p>
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
