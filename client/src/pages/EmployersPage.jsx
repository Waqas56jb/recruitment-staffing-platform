import ProcessStep from '../components/cards/ProcessStep'
import ServiceCard from '../components/cards/ServiceCard'
import StaffingRequestForm from '../components/forms/StaffingRequestForm'
import CtaBand from '../components/sections/CtaBand'
import PageHero from '../components/sections/PageHero'
import Accordion from '../components/ui/Accordion'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import OptimizedImage from '../components/ui/OptimizedImage'
import SectionHeading from '../components/ui/SectionHeading'
import { siteConfig } from '../config/site'
import { employerFaqs } from '../data/faqs'
import { images } from '../data/images'
import { howItWorks } from '../data/process'
import { services } from '../data/services'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

const challenges = [
  {
    title: 'Urgent cover without lowering standards',
    solution: 'Temporary and contract staffing with structured screening so speed does not replace suitability.',
  },
  {
    title: 'Permanent roles that need a genuine match',
    solution: 'Permanent recruitment focused on skills, experience, and practical fit for the team environment.',
  },
  {
    title: 'Fragmented workforce administration',
    solution: 'Support for timesheets, documentation, and billing coordination through one service relationship.',
  },
]

export default function EmployersPage() {
  const { t } = useI18n()
  usePageMeta({
    title: t('Employers'),
    description: t(
      'Request staff, fill temporary and permanent roles, and access workforce administration support with Staffora.',
    ),
  })

  const translatedFaqs = employerFaqs.map((faq) => ({
    ...faq,
    question: t(faq.question),
    answer: t(faq.answer),
  }))

  const employerServices = services.filter((service) =>
    [
      'permanent-recruitment',
      'temporary-staffing',
      'contract-staffing',
      'candidate-screening',
      'workforce-management',
      'hr-administration',
    ].includes(service.id),
  ).map((service) => ({
    ...service,
    title: t(service.title),
    short: t(service.short),
    description: t(service.description),
  }))

  return (
    <>
      <PageHero
        eyebrow={t('Employers')}
        title={t('Workforce solutions for ambitious businesses')}
        description={t(
          'From single critical hires to multi-role temporary cover, Staffora helps you request staff and manage the wider workforce process with clarity.',
        )}
        image={images.meeting}
        actions={
          <>
            <Button href="#staffing-request">{t('Request Staff')}</Button>
            <Button to="/services" variant="lightOutline">
              {t('Explore services')}
            </Button>
          </>
        }
      />

      <section className="section-pad bg-cream">
        <Container>
          <SectionHeading
            eyebrow={t('Challenges & solutions')}
            title={t('Hiring pressure, handled with structure')}
            description={t(
              'We translate operational needs into clear briefs, shortlists, and ongoing staffing support.',
            )}
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {challenges.map((item, index) => (
              <article key={item.title} className="card-shell p-5 sm:p-6">
                <span className="text-sm font-medium text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{t(item.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(item.solution)}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-pad bg-paper">
        <Container>
          <div className="grid items-center gap-6 md:gap-8 lg:grid-cols-2 lg:gap-10">
            <OptimizedImage
              src={images.workshop.src}
              alt={t(images.workshop.alt)}
              className="aspect-[16/11] rounded-2xl sm:aspect-[5/4]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="min-w-0">
              <SectionHeading
                className="max-w-none"
                eyebrow={t('Service options')}
                title={t('Temporary, permanent, and everything between')}
                description={t(
                  'Choose the pathway that matches demand — and keep screening, communication, and administration connected.',
                )}
              />
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted sm:mt-8 sm:space-y-4">
                <li>
                  <strong className="text-ink">{t('Temporary staffing')}</strong>{' '}
                  {t('for peaks, absences, and project cover.')}
                </li>
                <li>
                  <strong className="text-ink">{t('Permanent recruitment')}</strong>{' '}
                  {t('for lasting hires and team growth.')}
                </li>
                <li>
                  <strong className="text-ink">{t('Candidate screening')}</strong>{' '}
                  {t('to reduce interview noise.')}
                </li>
                <li>
                  <strong className="text-ink">{t('Workforce administration')}</strong>{' '}
                  {t('for timesheets, documentation, and billing support.')}
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-pad bg-cream">
        <Container>
          <SectionHeading eyebrow={t('Capabilities')} title={t('What employers use most')} />
          <div className="card-grid mt-8 sm:mt-10">
            {employerServices.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} compact />
            ))}
          </div>
        </Container>
      </section>

      <section className="section-pad bg-paper">
        <Container>
          <SectionHeading eyebrow={t('Process')} title={t('From briefing to ongoing support')} />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
            {howItWorks.map((step) => (
              <ProcessStep
                key={step.step}
                step={{ ...step, title: t(step.title), description: t(step.description) }}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="section-pad bg-cream">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:gap-10">
            <SectionHeading
              className="max-w-none"
              eyebrow={t('Employer FAQ')}
              title={t('Common questions from hiring teams')}
            />
            <Accordion items={translatedFaqs} />
          </div>
        </Container>
      </section>

      <section id="staffing-request" className="section-pad bg-paper scroll-mt-24">
        <Container>
          <div className="mb-6 flex flex-col gap-6 lg:mb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <SectionHeading
              className="max-w-2xl"
              eyebrow={t('Enquire')}
              title={t('Submit a staffing request')}
              description={t('Share the roles you need. The request is saved for the agency team.')}
            />
            <div className="hidden w-full max-w-xs overflow-hidden rounded-2xl lg:block xl:max-w-sm">
              <OptimizedImage
                src={images.desk.src}
                alt={t(images.desk.alt)}
                className="aspect-[16/10]"
                sizes="320px"
              />
            </div>
          </div>
          <StaffingRequestForm />
        </Container>
      </section>

      <CtaBand
        title={t('Prefer to talk through your brief first?')}
        description={t(
          'Use the contact page for general employer enquiries. Update real phone and address details in site configuration before launch.',
        )}
        actions={<Button to="/contact" variant="secondary">{t('Contact Staffora')}</Button>}
        image={images.formal}
      />
    </>
  )
}
