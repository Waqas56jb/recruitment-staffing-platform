import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import { siteConfig } from '../config/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { currentYear } from '../utils/format'

const content = {
  privacy: {
    title: 'Privacy Policy',
    summary:
      'This is a draft privacy policy placeholder for the Staffora public website. It requires legal review before launch.',
    sections: [
      {
        heading: 'Who we are',
        body: `${siteConfig.brand.name} is a recruitment and staffing brand represented by this demonstration website. Update the legal entity name, registration details, and contact identity before publication.`,
      },
      {
        heading: 'Information we may collect',
        body: 'Depending on how you use the site, we may collect enquiry details such as name, email address, phone number, company information, role preferences, and messages you submit through forms. CV uploads in this demo are validated in the browser only and are not stored remotely.',
      },
      {
        heading: 'How we use information',
        body: 'In a production deployment, information would be used to respond to enquiries, assess staffing needs, match candidates to suitable opportunities, and improve services. This demo does not transmit form data to a server.',
      },
      {
        heading: 'Your rights',
        body: 'Applicable privacy laws may give individuals rights to access, correct, delete, or restrict processing of personal data. Replace this section with jurisdiction-specific rights guidance after legal review.',
      },
      {
        heading: 'Contact',
        body: `For privacy questions, contact ${siteConfig.contact.email || 'the configured privacy contact'} once genuine details are supplied.`,
      },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    summary:
      'This is a draft cookie policy placeholder. Review and adapt it for your analytics and consent tooling before launch.',
    sections: [
      {
        heading: 'What cookies are',
        body: 'Cookies are small text files stored on your device. They can be essential for site operation or used optionally to understand how the website is used.',
      },
      {
        heading: 'Cookies used on this site',
        body: 'This demonstration site stores a local cookie-preference choice in your browser so the consent banner can remember your decision. No third-party analytics are wired by default.',
      },
      {
        heading: 'Managing preferences',
        body: 'You can clear site data in your browser settings to reset the cookie banner. If analytics or marketing cookies are added later, update this policy and the consent controls accordingly.',
      },
      {
        heading: 'Draft status',
        body: 'Do not treat this page as final legal advice. Have an appropriate professional review cookie disclosures for your jurisdictions and tooling.',
      },
    ],
  },
  terms: {
    title: 'Terms and Conditions',
    summary:
      'These draft terms are a starting point for the Staffora public website and require legal review before launch.',
    sections: [
      {
        heading: 'About these terms',
        body: `By using the ${siteConfig.brand.name} website, you agree to these draft terms for demonstration purposes. Replace them with binding terms approved for your operating entity.`,
      },
      {
        heading: 'Website purpose',
        body: 'This website provides information about recruitment and staffing services and collects demonstration enquiries. Job listings marked as sample are not live vacancies.',
      },
      {
        heading: 'No reliance on demo submissions',
        body: 'Forms on this website currently validate data in the browser only. Submission confirmation does not mean an enquiry was received, stored, or acted upon by Staffora systems.',
      },
      {
        heading: 'Intellectual property',
        body: 'Website design, copy, and brand assets are owned by the operating business or used under licence. Do not copy them without permission.',
      },
      {
        heading: 'Limitation of liability',
        body: 'Insert appropriate limitation and governing-law clauses after legal review. This draft does not create professional advice or guaranteed placement outcomes.',
      },
    ],
  },
}

export default function LegalPage({ type }) {
  const page = content[type]

  usePageMeta({
    title: page.title,
    description: page.summary,
  })

  return (
    <section className="bg-cream pt-32">
      <Container className="section-pad max-w-3xl">
        <p className="inline-flex rounded-sm bg-gold px-2.5 py-1 font-display text-xs font-semibold tracking-normal text-ink">
          Draft — legal review required
        </p>
        <h1 className="display-xl mt-5">{page.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">{page.summary}</p>

        <div className="mt-12 space-y-10">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-2xl font-bold tracking-tight">
                {section.heading}
              </h2>
              <p className="mt-3 leading-relaxed text-muted">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 text-sm text-muted">
          Last updated: {currentYear()} ·{' '}
          <Link to="/contact" className="text-ink underline-offset-4 hover:underline">
            Contact
          </Link>
        </p>
      </Container>
    </section>
  )
}
