import PageHero from '../components/sections/PageHero'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import OptimizedImage from '../components/ui/OptimizedImage'
import SectionHeading from '../components/ui/SectionHeading'
import { siteConfig } from '../config/site'
import { images } from '../data/images'
import { usePageMeta } from '../hooks/usePageMeta'

const pillars = [
  {
    title: 'Mission',
    body: 'Help businesses hire with confidence and help people find work that fits — through clear process, respectful communication, and dependable staffing support.',
  },
  {
    title: 'Service philosophy',
    body: 'Premium does not mean complicated. Every brief, shortlist, and update should feel intentional, transparent, and commercially useful.',
  },
  {
    title: 'Recruitment approach',
    body: 'We start with the work itself: skills, environment, timing, and expectations. Screening follows the brief, not generic volume.',
  },
  {
    title: 'Responsible recruitment',
    body: 'We aim for fair candidate treatment, honest role representation, and employer guidance that respects both operational urgency and people.',
  },
]

export default function AboutPage() {
  usePageMeta({
    title: 'About',
    description: `Learn about ${siteConfig.brand.name} — mission, service philosophy, and recruitment approach.`,
  })

  return (
    <>
      <PageHero
        eyebrow="About"
        title={`${siteConfig.brand.name} exists to connect great people with stronger businesses`}
        description="A temporary brand name you can replace later — with a permanent commitment to professional staffing craft."
        image={images.about}
      />

      <section className="section-pad bg-cream">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            {pillars.map((item) => (
              <article key={item.title} className="rounded-2xl border border-line bg-white p-7">
                <h2 className="display-md text-[1.75rem]">{item.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{item.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-pad bg-paper">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <OptimizedImage
              src={images.team.src}
              alt={images.team.alt}
              className="aspect-[5/4] rounded-2xl"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div>
              <SectionHeading
                eyebrow="Relationships"
                title="Employers and candidates, both matter"
                description="Strong placements come from understanding operational reality and candidate ambition at the same time."
              />
              <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted">
                <p>
                  For employers, that means briefs that capture the work, screening that reduces noise, and communication that stays useful under pressure.
                </p>
                <p>
                  For candidates, that means clear expectations, respectful process, and introductions that make sense for their experience.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-pad bg-cream">
        <Container>
          <SectionHeading
            eyebrow="Placeholders"
            title="Company history and team details coming soon"
            description="Genuine company history, leadership biographies, office locations, and team information should replace these placeholders before launch."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {['Company history', 'Leadership team', 'Locations'].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-dashed border-line bg-paper px-5 py-10 text-center"
              >
                <h3 className="font-display text-xl font-bold tracking-tight">{item}</h3>
                <p className="mt-3 text-sm text-muted">Content placeholder</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button to="/contact">Contact us</Button>
            <Button to="/employers" variant="outline">
              Employer solutions
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}
