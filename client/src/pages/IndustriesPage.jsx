import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PageHero from '../components/sections/PageHero'
import CtaBand from '../components/sections/CtaBand'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import OptimizedImage from '../components/ui/OptimizedImage'
import { images } from '../data/images'
import { industries } from '../data/industries'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'
import { cn } from '../utils/cn'

export default function IndustriesPage() {
  const location = useLocation()
  const { t } = useI18n()
  usePageMeta({
    title: t('Industries'),
    description: t(
      'Industry staffing solutions across logistics, manufacturing, hospitality, retail, office, IT, and healthcare support.',
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
        eyebrow={t('Industries')}
        title={t('Sector-aware staffing for real operations')}
        description={t(
          'Configurable industry coverage with typical roles, operational context, and clear next steps for employers and candidates.',
        )}
        image={images.logistics}
        actions={<Button to="/employers#staffing-request">{t('Discuss your sector')}</Button>}
      />

      <section className="section-pad bg-cream">
        <Container className="space-y-16">
          {industries.map((industry, index) => (
            <article
              key={industry.id}
              id={industry.id}
              className="scroll-mt-28 grid items-center gap-8 lg:grid-cols-2"
            >
              <OptimizedImage
                src={industry.image.src}
                alt={t(industry.image.alt)}
                className={cn('aspect-[5/4] rounded-2xl', index % 2 === 1 && 'lg:order-2')}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className={cn(index % 2 === 1 && 'lg:order-1')}>
                <p className="eyebrow text-accent">{t('Industry focus')}</p>
                <h2 className="display-lg mt-3">{t(industry.title)}</h2>
                <p className="mt-5 leading-relaxed text-muted">{t(industry.summary)}</p>
                <h3 className="mt-8 font-display text-sm font-semibold tracking-normal">
                  {t('Typical roles')}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {industry.roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-md border border-line bg-white px-3 py-1.5 text-sm text-ink"
                    >
                      {t(role)}
                    </span>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button to="/employers#staffing-request">{t('Request staff')}</Button>
                  <Button to="/jobs" variant="outline">
                    {t('View sample jobs')}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </Container>
      </section>

      <CtaBand
        tone="cream"
        title={t('Don’t see your industry listed?')}
        description={t(
          'Industry data is configurable. Contact us with your sector requirements and role profiles.',
        )}
        actions={<Button to="/contact" variant="dark">{t('Contact us')}</Button>}
        image={images.about}
      />
    </>
  )
}
