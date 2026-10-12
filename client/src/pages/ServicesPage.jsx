import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  CalendarCheck,
  Clock3,
  FileSignature,
  FolderKanban,
  Network,
  Receipt,
  ScrollText,
  SearchCheck,
  UserCheck,
  Wallet,
} from 'lucide-react'
import PageHero from '../components/sections/PageHero'
import CtaBand from '../components/sections/CtaBand'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import OptimizedImage from '../components/ui/OptimizedImage'
import SectionHeading from '../components/ui/SectionHeading'
import { images } from '../data/images'
import { services } from '../data/services'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'
import { cn } from '../utils/cn'

const icons = {
  UserCheck,
  Clock3,
  FileSignature,
  SearchCheck,
  Network,
  FolderKanban,
  Wallet,
  CalendarCheck,
  ScrollText,
  Receipt,
}

export default function ServicesPage() {
  const location = useLocation()
  const { t } = useI18n()
  usePageMeta({
    title: t('Services'),
    description: t(
      'Explore Staffora recruitment, temporary staffing, screening, workforce management, and administration services.',
    ),
  })

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  return (
    <>
      <PageHero
        eyebrow={t('Services')}
        title={t('Recruitment and workforce services with clarity')}
        description={t(
          'A connected set of staffing capabilities — from sourcing and screening to administration support. Payroll execution and statutory compliance may require specialist providers.',
        )}
        image={images.services}
        actions={<Button to="/employers#staffing-request">{t('Request Staff')}</Button>}
      />

      <section className="section-pad bg-cream">
        <Container className="space-y-16">
          {services.map((service, index) => {
            const Icon = icons[service.icon] || UserCheck
            const reverse = index % 2 === 1
            return (
              <article
                key={service.id}
                id={service.id}
                className="scroll-mt-28 grid items-center gap-8 rounded-2xl border border-line bg-white p-6 shadow-soft lg:grid-cols-2 lg:p-10"
              >
                <div className={cn(reverse && 'lg:order-2')}>
                  <div className="inline-flex rounded-md bg-ink/5 p-3">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <p className="eyebrow mt-5 text-accent">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h2 className="display-md mt-3">{t(service.title)}</h2>
                  <p className="mt-4 leading-relaxed text-muted">{t(service.description)}</p>
                </div>
                <div className={cn('overflow-hidden rounded-xl', reverse && 'lg:order-1')}>
                  <OptimizedImage
                    src={
                      [
                        images.meeting.src,
                        images.team.src,
                        images.workshop.src,
                        images.interview.src,
                        images.office.src,
                        images.desk.src,
                        images.admin.src,
                        images.tech.src,
                        images.formal.src,
                        images.employers.src,
                      ][index % 10]
                    }
                    alt={t(service.title)}
                    className="aspect-[16/11]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </article>
            )
          })}
        </Container>
      </section>

      <section className="section-pad bg-paper">
        <Container>
          <SectionHeading
            eyebrow={t('Important note')}
            title={t('Where specialist partners may be required')}
            description={t(
              'Staffora can support payroll administration workflows, timesheets, contracts, and billing coordination. Actual payroll execution, legal compliance advice, and salary transfers may require specialist providers or external integrations.',
            )}
          />
        </Container>
      </section>

      <CtaBand
        title={t('Ready to brief a role?')}
        description={t(
          'Tell us what your business needs and we will outline the most suitable staffing pathway.',
        )}
        actions={<Button to="/employers#staffing-request">{t('Submit a staffing request')}</Button>}
        image={images.employerCta}
      />
    </>
  )
}
