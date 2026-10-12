import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '@staffora/api'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import IndustryCard from '../components/cards/IndustryCard'
import JobCard from '../components/cards/JobCard'
import ProcessStep from '../components/cards/ProcessStep'
import ServiceCard from '../components/cards/ServiceCard'
import CtaBand from '../components/sections/CtaBand'
import Accordion from '../components/ui/Accordion'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import OptimizedImage from '../components/ui/OptimizedImage'
import SectionHeading from '../components/ui/SectionHeading'
import { siteConfig } from '../config/site'
import { homeFaqs } from '../data/faqs'
import { images } from '../data/images'
import { industries } from '../data/industries'
import { howItWorks, whyChooseUs } from '../data/process'
import { services } from '../data/services'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
}

export default function HomePage() {
  const { t } = useI18n()
  usePageMeta({
    title: t('Home'),
    description: t(siteConfig.seo.defaultDescription),
  })
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    let cancelled = false
    api('/api/public/jobs')
      .then((data) => {
        if (!cancelled) setJobs(Array.isArray(data) ? data.slice(0, 3) : [])
      })
      .catch(() => {
        if (!cancelled) setJobs([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <section className="relative min-h-[100svh] overflow-hidden bg-ink text-white">
        <OptimizedImage
          src={images.hero.src}
          alt={t(images.hero.alt)}
          priority
          className="absolute inset-0"
          imgClassName="opacity-60 scale-105"
          objectPosition="center 28%"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />

        <Container className="relative flex min-h-[85svh] flex-col justify-end pb-10 pt-24 sm:min-h-[90svh] sm:pb-16 sm:pt-32 lg:min-h-[100svh] lg:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <p className="eyebrow text-gold-soft">{t(siteConfig.brand.tagline)}</p>
            <h1 className="display-hero mt-4 sm:mt-5">
              {t('Great People.')}
              <br />
              {t('Stronger Businesses.')}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:mt-6 sm:text-base">
              {t(siteConfig.brand.shortDescription)}
            </p>
            <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap sm:mt-9">
              <Button to={siteConfig.cta.requestStaff} size="lg" className="w-full xs:w-auto">
                {t('Request Staff')}
              </Button>
              <Button to={siteConfig.cta.exploreCareers} variant="lightOutline" size="lg" className="w-full xs:w-auto">
                {t('Explore Careers')}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-10 grid gap-3 border-t border-white/15 pt-5 sm:mt-14 sm:grid-cols-3 sm:gap-4 sm:pt-6"
          >
            {['Recruitment', 'Staffing', 'Workforce Management'].map((item) => (
              <p key={item} className="text-sm font-medium text-white/65">
                {t(item)}
              </p>
            ))}
          </motion.div>
        </Container>
      </section>

      <section className="section-pad bg-cream">
        <Container>
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            <motion.article {...fadeUp} className="card-shell flex flex-col overflow-hidden sm:flex-row">
              <OptimizedImage
                src={images.employers.src}
                alt={t(images.employers.alt)}
                className="aspect-[16/10] sm:aspect-auto sm:w-2/5"
                sizes="(max-width: 1024px) 100vw, 25vw"
              />
              <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                <Badge tone="cream">{t('For employers')}</Badge>
                <h2 className="mt-3 text-xl font-semibold sm:text-2xl">{t('Your workforce, handled')}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t('Request staff, fill critical roles, and get recruitment support built around how your business operates.')}
                </p>
                <div className="mt-5">
                  <Button to="/employers" size="sm">{t('Find your workforce')}</Button>
                </div>
              </div>
            </motion.article>

            <motion.article {...fadeUp} className="card-shell flex flex-col overflow-hidden sm:flex-row">
              <OptimizedImage
                src={images.candidates.src}
                alt={t(images.candidates.alt)}
                className="aspect-[16/10] sm:aspect-auto sm:w-2/5"
                sizes="(max-width: 1024px) 100vw, 25vw"
              />
              <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                <Badge tone="gold">{t('For candidates')}</Badge>
                <h2 className="mt-3 text-xl font-semibold sm:text-2xl">{t('Your next opportunity')}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t('Explore roles and connect with temporary, contract, and permanent pathways.')}
                </p>
                <div className="mt-5">
                  <Button to="/candidates" size="sm">{t('Explore careers')}</Button>
                </div>
              </div>
            </motion.article>
          </div>
        </Container>
      </section>

      <section className="section-pad bg-paper">
        <Container>
          <SectionHeading
            eyebrow={t('Services')}
            title={t('Recruitment and staffing, end to end')}
            description={t('From permanent hires to temporary cover and workforce administration — one partner across the full staffing lifecycle.')}
          />
          <div className="card-grid mt-8 sm:mt-10">
            {services.map((service, index) => (
              <motion.div key={service.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: (index % 3) * 0.05 }}>
                <ServiceCard service={service} index={index} compact />
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-pad bg-cream">
        <Container>
          <SectionHeading
            eyebrow={t('How it works')}
            title={t('A clear path from brief to workforce support')}
            description={t('Four deliberate steps that keep hiring managers informed and candidates progressing with clarity.')}
          />
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
            {howItWorks.map((step) => (
              <ProcessStep key={step.step} step={step} />
            ))}
          </div>
        </Container>
      </section>

      <section className="section-pad bg-paper">
        <Container>
          <SectionHeading
            eyebrow={t('Industries')}
            title={t('Staffing shaped around your sector')}
            description={t('Specialist coverage across operational, customer-facing, and professional environments.')}
          />
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
            {industries.map((industry) => (
              <IndustryCard key={industry.id} industry={industry} />
            ))}
          </div>
        </Container>
      </section>

      <section className="section-pad bg-cream">
        <Container>
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10">
            <SectionHeading
              className="max-w-none"
              eyebrow={t('Why Staffora')}
              title={t('Built for trust, speed, and human connection')}
              description={t('A clear staffing presence without invented statistics, fake reviews, or borrowed credibility.')}
            />
            <OptimizedImage
              src={images.team.src}
              alt={t(images.team.alt)}
              className="aspect-[16/10] rounded-xl"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="card-grid mt-8 sm:mt-10">
            {whyChooseUs.map((item, index) => (
              <div key={item.title} className="card-shell p-5 sm:p-6">
                <span className="text-sm font-medium text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{t(item.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(item.description)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-pad bg-paper">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow={t('Opportunities')}
              title={t('Featured roles')}
              description={t('Published vacancies from the Staffora board.')}
            />
            <Button to="/jobs" variant="secondary">
              {t('Explore all jobs')}
            </Button>
          </div>
          <div className="card-grid mt-8 sm:mt-10">
            {jobs.slice(0, 3).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            {jobs.length ? null : <p className="text-sm text-muted">{t('Published roles will appear here.')}</p>}
          </div>
        </Container>
      </section>

      <CtaBand
        eyebrow={t('Employers')}
        title={t('Need the Right People to Move Your Business Forward?')}
        description={t('Share your staffing brief and explore how Staffora can support recruitment, temporary cover, and workforce administration.')}
        image={images.employerCta}
        actions={
          <>
            <Button to={siteConfig.cta.requestStaff}>{t('Submit a Staffing Request')}</Button>
            <Button to="/services" variant="lightOutline">
              {t('View services')}
            </Button>
          </>
        }
      />

      <CtaBand
        tone="cream"
        eyebrow={t('Candidates')}
        title={t('Your skills deserve the right opportunity')}
        description={t('Browse open roles, register your interest, and apply once you have a candidate account.')}
        image={images.candidateCta}
        actions={
          <>
            <Button to="/jobs">{t('Explore opportunities')}</Button>
            <Button to="/candidates#interest" variant="secondary">
              {t('Register interest')}
            </Button>
          </>
        }
      />

      <section className="section-pad bg-cream">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:gap-10">
            <SectionHeading
              className="max-w-none"
              eyebrow={t('FAQ')}
              title={t('Answers before you enquire')}
              description={t('Clear guidance on staffing, recruitment pathways, and how to get in touch.')}
            />
            <Accordion items={homeFaqs.map((faq) => ({ ...faq, question: t(faq.question), answer: t(faq.answer) }))} />
          </div>
          <p className="mt-8 text-sm text-muted">
            {t('Still deciding?')}{' '}
            <Link to="/contact" className="font-medium text-ink underline-offset-4 hover:underline">
              {t('Contact the team')}
            </Link>
            <ArrowRight className="ml-1 inline h-3.5 w-3.5" aria-hidden />
          </p>
        </Container>
      </section>
    </>
  )
}
