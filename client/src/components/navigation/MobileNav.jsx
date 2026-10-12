import { NavLink } from 'react-router-dom'
import { panelUrl, readStoredSession } from '@staffora/auth'
import { mainNav } from '../../data/nav'
import { siteConfig } from '../../config/site'
import { cn } from '../../utils/cn'
import Button from '../ui/Button'
import Container from '../ui/Container'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { useI18n } from '../../i18n'

export default function MobileNav({ open, onNavigate, solid = true }) {
  const { t } = useI18n()
  const session = readStoredSession()
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
            {t(item.label)}
          </NavLink>
        ))}
        <div className="mt-3 grid gap-2 border-t border-line pt-4">
          <LanguageSwitcher variant={solid ? 'light' : 'dark'} className="justify-self-start" />
          {session ? (
            <Button href={panelUrl(session)} variant="secondary" onClick={onNavigate}>
              {t('My panel')}
            </Button>
          ) : (
            <>
              <Button to="/login" variant="secondary" onClick={onNavigate}>
                {t('Sign in')}
              </Button>
              <Button to="/register" variant="outline" onClick={onNavigate}>
                {t('Register')}
              </Button>
            </>
          )}
          <Button to={siteConfig.cta.findJob} variant="outline" onClick={onNavigate}>
            {t('Find a Job')}
          </Button>
          <Button to={siteConfig.cta.requestStaff} onClick={onNavigate}>
            {t('Request Staff')}
          </Button>
        </div>
      </Container>
    </div>
  )
}
