import ContactForm from '../components/forms/ContactForm'
import PageHero from '../components/sections/PageHero'
import Container from '../components/ui/Container'
import SectionHeading from '../components/ui/SectionHeading'
import { siteConfig } from '../config/site'
import { images } from '../data/images'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ContactPage() {
  usePageMeta({
    title: 'Contact',
    description: 'Contact Staffora for employer staffing requests, candidate enquiries, and general questions.',
  })

  const details = [
    {
      label: 'Email',
      value: siteConfig.contact.email || 'Configure in site settings',
      href: siteConfig.contact.email ? `mailto:${siteConfig.contact.email}` : undefined,
    },
    {
      label: 'Phone',
      value: siteConfig.contact.phoneDisplay || 'Not configured yet',
      href: siteConfig.contact.phone ? `tel:${siteConfig.contact.phone}` : undefined,
    },
    {
      label: 'WhatsApp',
      value: 'Chat on WhatsApp',
      href: siteConfig.contact.whatsapp,
      external: true,
    },
    {
      label: 'Address',
      value: siteConfig.contact.address || 'Not configured yet',
    },
    {
      label: 'Hours',
      value: siteConfig.contact.hours || 'Not configured yet',
    },
  ]

  return (
    <>
      <PageHero
        compact
        eyebrow="Contact"
        title="Let’s talk about your workforce needs"
        description="Send a message, email the team, or start a WhatsApp chat."
        image={images.desk}
      />

      <section className="section-pad bg-cream">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.6fr)] lg:gap-10 xl:gap-12">
            <div className="min-w-0">
              <SectionHeading
                className="max-w-none"
                eyebrow="Details"
                title="How to reach Staffora"
                description="Update genuine contact details in `src/config/site.js` before launch."
              />
              <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-1">
                {details.map((item) => (
                  <div key={item.label} className="rounded-xl border border-line bg-white p-4">
                    <dt className="font-display text-sm font-semibold tracking-normal text-muted">
                      {item.label}
                    </dt>
                    <dd className="mt-2 break-words text-ink">
                      {item.href ? (
                        <a href={item.href} className="hover:text-accent" {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="min-w-0">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
