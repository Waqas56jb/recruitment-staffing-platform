import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { panelUrl, readStoredSession } from '@staffora/auth'
import { siteConfig } from '../../config/site'
import { mainNav } from '../../data/nav'
import { useScrollHeader } from '../../hooks/useScrollHeader'
import { cn } from '../../utils/cn'
import MobileNav from '../navigation/MobileNav'
import Button from '../ui/Button'
import Container from '../ui/Container'

export default function Header() {
  const scrolled = useScrollHeader()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const solid = scrolled || !isHome || open
  const session = readStoredSession()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition duration-200',
        solid
          ? 'border-line bg-white text-ink shadow-sm'
          : 'border-transparent bg-transparent text-white',
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-3 sm:h-[68px]">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label={`${siteConfig.brand.name} home`}>
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-bold',
              solid ? 'bg-ink text-white' : 'bg-white text-ink',
            )}
          >
            S
          </span>
          <span className="truncate text-lg font-semibold tracking-tight sm:text-xl">
            {siteConfig.brand.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition',
                  solid
                    ? isActive
                      ? 'bg-cream text-ink'
                      : 'text-muted hover:bg-cream hover:text-ink'
                    : isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white',
                )
              }
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <a
              href={panelUrl(session)}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium',
                solid ? 'text-ink hover:bg-cream' : 'text-white hover:bg-white/10',
              )}
            >
              My panel
            </a>
          ) : (
            <Link
              to="/login"
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium',
                solid ? 'text-ink hover:bg-cream' : 'text-white hover:bg-white/10',
              )}
            >
              Sign in
            </Link>
          )}
          {session ? null : (
            <Button to="/register" variant={solid ? 'secondary' : 'lightOutline'} size="sm">
              Register
            </Button>
          )}
          <Button
            to={siteConfig.cta.findJob}
            variant={solid ? 'outline' : 'lightOutline'}
            size="sm"
          >
            Find a Job
          </Button>
          <Button to={siteConfig.cta.requestStaff} size="sm">
            Request Staff
          </Button>
        </div>

        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center rounded-md border p-2 xl:hidden',
            solid ? 'border-line text-ink' : 'border-white/30 text-white',
          )}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      <MobileNav open={open} onNavigate={() => setOpen(false)} solid />
    </header>
  )
}
