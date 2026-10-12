import { Link } from 'react-router-dom'
import ProcessStep from '../components/cards/ProcessStep'
import CandidateInterestForm from '../components/forms/CandidateInterestForm'
import PageHero from '../components/sections/PageHero'
import Accordion from '../components/ui/Accordion'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import OptimizedImage from '../components/ui/OptimizedImage'
import SectionHeading from '../components/ui/SectionHeading'
import { candidateFaqs } from '../data/faqs'
import { images } from '../data/images'
import { industries } from '../data/industries'
import { candidateProcess } from '../data/process'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

const benefits = [
  'Access temporary, contract, and permanent pathways through one agency relationship.',
  'Clear conversations about role expectations, location, and working patterns.',
  'Structured screening that helps match your experience to suitable opportunities.',
  'Support through interviews and onboarding coordination as roles progress.',
]

const screeningAreas = ['Experience & skills', 'Availability & preferences', 'Role suitability']

export default function CandidatesPage() {
  const { t } = useI18n()
  usePageMeta({
    title: t('Candidates'),
    description: t(
      'Explore careers with Staffora — register interest, learn the recruitment process, and browse opportunities.',
    ),
  })

  const translatedFaqs = candidateFaqs.map((faq) => ({
    ...faq,
    question: t(faq.question),
    answer: t(faq.answer),
  }))

  return (
    <>
      <PageHero
        eyebrow={t('Candidates')}
        title={t('Build your next chapter with confidence')}
        description={t(
          'Whether you want flexible temporary work or a permanent move, Staffora helps you present your experience clearly and explore suitable opportunities.',
        )}
        image={images.interview}
        actions={
          <>
            <Button to="/jobs">{t('Browse jobs')}</Button>
            <Button href="#interest" variant="lightOutline">
              {t('Register interest')}
            </Button>
          </>
        }
      />

      <section className="section-pad bg-cream">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow={t('Benefits')}
                title={t('Why candidates work with Staffora')}
                description={t('A professional, respectful process focused on fit — not noise.')}
              />
              <ul className="mt-8 space-y-4">
                {benefits.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    {t(item)}
                  </li>
                ))}
              </ul>
            </div>
            <OptimizedImage
              src={images.candidates.src}
              alt={t(images.candidates.alt)}
              className="aspect-[5/4] rounded-2xl"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </Container>
      </section>

      <section id="process" className="section-pad bg-paper scroll-mt-28">
        <Container>
          <SectionHeading eyebrow={t('Process')} title={t('How candidate recruitment works')} />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {candidateProcess.map((step, index) => (
              <ProcessStep
                key={step.step}
                step={{ ...step, title: t(step.title), description: t(step.description) }}
                index={index}
                total={candidateProcess.length}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="section-pad bg-ink text-cream">
        <Container>
          <SectionHeading
            tone="dark"
            eyebrow={t('Screening')}
            title={t('A fair, structured review')}
            description={t(
              'We look at experience, skills, availability, and role suitability so introductions are purposeful for everyone involved.',
            )}
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {screeningAreas.map((item, index) => (
              <div key={item} className="rounded-xl border border-cream/15 bg-white/5 p-6">
                <p className="font-display text-sm font-semibold tracking-normal text-gold-soft">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">{t(item)}</h3>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-pad bg-cream">
        <Container>
          <SectionHeading
            eyebrow={t('Categories')}
            title={t('Where candidates often find opportunities')}
            description={t(
              'Industry pathways are configurable and will connect to live vacancies as they are supplied.',
            )}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((industry) => (
              <Link
                key={industry.id}
                to={`/industries#${industry.id}`}
                className="card-shell card-interactive block p-5"
              >
                <h3 className="font-display text-lg font-bold tracking-tight">
                  {t(industry.title)}
                </h3>
                <p className="mt-2 text-sm text-muted line-clamp-2">{t(industry.summary)}</p>
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <Button to="/jobs" variant="dark">
              {t('Search jobs')}
            </Button>
          </div>
        </Container>
      </section>

      <section className="section-pad bg-paper">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:gap-10">
            <SectionHeading className="max-w-none" eyebrow={t('FAQ')} title={t('Candidate questions')} />
            <Accordion items={translatedFaqs} />
          </div>
        </Container>
      </section>

      <section id="interest" className="section-pad bg-cream scroll-mt-24">
        <Container>
          <div className="mb-6 flex flex-col gap-6 lg:mb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <SectionHeading
              className="max-w-2xl"
              eyebrow={t('Register')}
              title={t('Expression of interest')}
              description={t(
                'Share your preferences and optionally attach a CV. Storage and delivery require future backend integration.',
              )}
            />
            <div className="hidden w-full max-w-xs overflow-hidden rounded-2xl lg:block xl:max-w-sm">
              <OptimizedImage
                src={images.formal.src}
                alt={t(images.formal.alt)}
                className="aspect-[16/10]"
                sizes="320px"
              />
            </div>
          </div>
          <CandidateInterestForm />
        </Container>
      </section>
    </>
  )
}
