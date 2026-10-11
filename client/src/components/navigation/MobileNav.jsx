import { NavLink } from 'react-router-dom'
import { mainNav } from '../../data/nav'
import { siteConfig } from '../../config/site'
import { cn } from '../../utils/cn'
import Button from '../ui/Button'
import Container from '../ui/Container'

export default function MobileNav({ open, onNavigate, solid = true }) {
  return (
    <div
      id="mobile-nav"
      className={cn(
        'border-t xl:hidden',
        solid ? 'border-line bg-white' : 'border-white/10 bg-ink',
        open ? 'block' : 'hidden',
      )}
    >
      <Container className="flex max-h-[calc(100svh-64px)] flex-col gap-1 overflow-y-auto py-3">
        {mainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-3 text-base font-medium',
                solid
                  ? isActive
                    ? 'bg-cream text-ink'
                    : 'text-ink hover:bg-cream'
                  : isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white',
              )
            }
            end={item.to === '/'}
          >
            {item.label}
          </NavLink>
        ))}
        <div className="mt-3 grid gap-2 border-t border-line pt-4">
          <Button to={siteConfig.cta.findJob} variant="secondary" onClick={onNavigate}>
            Find a Job
          </Button>
          <Button to={siteConfig.cta.requestStaff} onClick={onNavigate}>
            Request Staff
          </Button>
        </div>
      </Container>
    </div>
  )
}
