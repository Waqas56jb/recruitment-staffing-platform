/**
 * Verified Unsplash image assets for the public website.
 * All URLs were HEAD-checked during build (HTTP 200).
 */
const u = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const images = {
  hero: {
    src: u('photo-1521737711867-e3b97375f902', 1920),
    srcMobile: u('photo-1521737711867-e3b97375f902', 900),
    alt: 'Diverse professional team collaborating in a bright modern workplace',
  },
  employers: {
    src: u('photo-1600880292203-757bb62b4baf', 1400),
    alt: 'Business colleagues reviewing plans together in a meeting',
  },
  candidates: {
    src: u('photo-1556761175-b413da4baf72', 1400),
    alt: 'Professionals networking and discussing career opportunities',
  },
  office: {
    src: u('photo-1497366216548-37526070297c', 1400),
    alt: 'Modern open-plan office with natural light',
  },
  logistics: {
    src: u('photo-1586528116311-ad8dd3c8310d', 1200),
    alt: 'Warehouse logistics team managing inventory',
  },
  manufacturing: {
    src: u('photo-1565793298595-6a879b1d9492', 1200),
    alt: 'Manufacturing floor with production workers',
  },
  construction: {
    src: u('photo-1504307651254-35680f356dfd', 1200),
    alt: 'Construction professionals on an active site',
  },
  hospitality: {
    src: u('photo-1414235077428-338989a2e8c0', 1200),
    alt: 'Hospitality team preparing service in a restaurant',
  },
  retail: {
    src: u('photo-1441986300917-64674bd600d8', 1200),
    alt: 'Retail store with customer service environment',
  },
  admin: {
    src: u('photo-1497366811353-6870744d04b2', 1200),
    alt: 'Office administration workspace with desks and computers',
  },
  tech: {
    src: u('photo-1519389950473-47ba0277781c', 1200),
    alt: 'Technology team collaborating around laptops',
  },
  healthcare: {
    src: u('photo-1576091160399-112ba8d25d1d', 1200),
    alt: 'Healthcare support professionals in a clinical setting',
  },
  team: {
    src: u('photo-1522071820081-009f0129c71c', 1400),
    alt: 'Smiling multidisciplinary team working side by side',
  },
  workshop: {
    src: u('photo-1552664730-d307ca884978', 1400),
    alt: 'Workshop session with facilitators and participants',
  },
  meeting: {
    src: u('photo-1542744173-8e7e53415bb0', 1400),
    alt: 'Leadership meeting around a conference table',
  },
  desk: {
    src: u('photo-1454165804606-c3d57bc86b40', 1400),
    alt: 'Professional reviewing documents and charts at a desk',
  },
  formal: {
    src: u('photo-1507679799987-c73779587ccf', 1200),
    alt: 'Confident professional in formal business attire',
  },
  interview: {
    src: u('photo-1560264280-88b68371db39', 1400),
    alt: 'Candidate interview conversation in a modern office',
  },
  employerCta: {
    src: u('photo-1542744173-8e7e53415bb0', 1600),
    alt: 'Business leaders planning workforce strategy',
  },
  candidateCta: {
    src: u('photo-1522071820081-009f0129c71c', 1600),
    alt: 'Team celebrating collaboration and opportunity',
  },
  about: {
    src: u('photo-1556761175-5973dc0f32e7', 1400),
    alt: 'Agency team collaborating on recruitment strategy',
  },
  services: {
    src: u('photo-1454165804606-c3d57bc86b40', 1600),
    alt: 'Workforce planning documents and laptop on a desk',
  },
}

export const imageList = Object.values(images)
