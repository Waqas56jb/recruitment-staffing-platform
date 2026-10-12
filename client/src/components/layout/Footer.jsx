import { Link } from 'react-router-dom'
import { siteConfig } from '../../config/site'
import {
  candidateLinks,
  employerLinks,
  industryLinks,
  legalLinks,
  serviceLinks,
} from '../../data/nav'
import { currentYear } from '../../utils/format'
import Container from '../ui/Container'
import { useI18n } from '../../i18n'

function FooterColumn({ title, links }) {
  const { t } = useI18n()
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{t(title)}</h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.to + link.label}>
            <Link to={link.to} className="text-sm text-white/65 transition hover:text-white">
              {t(link.label)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const { t } = useI18n()
  const socialEntries = Object.entries(siteConfig.social).filter(([, value]) => value)

  return (
    <footer className="bg-ink text-white">
      <Container className="section-pad">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr] lg:gap-12">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-sm font-bold text-ink">
                S
              </span>
              <span className="text-lg font-semibold tracking-tight">
                {siteConfig.brand.name}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              {t(siteConfig.brand.shortDescription)}
            </p>
            <div className="mt-5 space-y-1.5 text-sm text-white/65">
              {siteConfig.contact.email ? (
                <p>
                  <a className="hover:text-white" href={`mailto:${siteConfig.contact.email}`}>
                    {siteConfig.contact.email}
                  </a>
                </p>
              ) : null}
              {siteConfig.contact.phoneDisplay ? (
                <p>{siteConfig.contact.phoneDisplay}</p>
              ) : (
                <p className="text-white/40">{t('Phone number to be configured')}</p>
              )}
              {siteConfig.contact.address ? (
                <p>{siteConfig.contact.address}</p>
              ) : (
                <p className="text-white/40">{t('Address to be configured')}</p>
              )}
              {siteConfig.contact.hours ? <p>{t(siteConfig.contact.hours)}</p> : null}
            </div>
            {socialEntries.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {socialEntries.map(([network, href]) => (
                  <a
                    key={network}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-white/20 px-3 py-1.5 text-sm capitalize text-white/80 hover:bg-white hover:text-ink"
                  >
                    {network}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FooterColumn title="Employers" links={employerLinks} />
            <FooterColumn title="Candidates" links={candidateLinks} />
            <FooterColumn title="Services" links={serviceLinks} />
            <FooterColumn title="Industries" links={industryLinks} />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {t('© {year} {name}. All rights reserved.', { year: currentYear(), name: siteConfig.brand.legalName })}
          </p>
          <div className="flex flex-wrap gap-4">
            {legalLinks.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-white">
                {t(link.label)}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  )
}
