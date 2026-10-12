import { useEffect, useMemo, useState } from 'react'
import { api } from '@staffora/api'
import JobCard from '../components/cards/JobCard'
import PageHero from '../components/sections/PageHero'
import EmptyState from '../components/ui/EmptyState'
import Container from '../components/ui/Container'
import { images } from '../data/images'
import { employmentTypes, jobCategories } from '../data/jobs'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title-asc', label: 'Title A–Z' },
  { value: 'title-desc', label: 'Title Z–A' },
]

export default function JobsPage() {
  const { t } = useI18n()
  usePageMeta({
    title: t('Jobs'),
    description: t('Browse published Staffora vacancies. Filter by location, category, and employment type.'),
  })

  const [jobs, setJobs] = useState([])
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    let cancelled = false
    api('/api/public/jobs')
      .then((data) => {
        if (!cancelled) setJobs(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setJobs([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const locations = useMemo(
    () => [...new Set(jobs.map((job) => job.location))].sort(),
    [jobs],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = jobs.filter((job) => {
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        (job.summary || '').toLowerCase().includes(q) ||
        (job.department || '').toLowerCase().includes(q)
      const matchesLocation = !location || job.location === location
      const matchesCategory = !category || job.category === category
      const matchesType = !employmentType || job.employmentType === employmentType
      return matchesQuery && matchesLocation && matchesCategory && matchesType
    })

    list = [...list].sort((a, b) => {
      if (sort === 'oldest') return String(a.postedAt || '').localeCompare(String(b.postedAt || ''))
      if (sort === 'title-asc') return a.title.localeCompare(b.title)
      if (sort === 'title-desc') return b.title.localeCompare(a.title)
      return String(b.postedAt || '').localeCompare(String(a.postedAt || ''))
    })

    return list
  }, [jobs, query, location, category, employmentType, sort])

  return (
    <>
      <PageHero
        compact
        eyebrow={t('Careers')}
        title={t('Find your next opportunity')}
        description={t('Published roles from Staffora. Use the filters to narrow the list.')}
        image={images.office}
      />

      <section className="section-pad bg-cream">
        <Container>
          <form
            className="card-shell grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-5"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="block text-sm xl:col-span-2">
              <span className="mb-2 block font-medium">{t('Search')}</span>
              <input
                className="input-field"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('Role, keyword, department')}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block font-medium">{t('Location')}</span>
              <select className="input-field" value={location} onChange={(event) => setLocation(event.target.value)}>
                <option value="">{t('All locations')}</option>
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-2 block font-medium">{t('Category')}</span>
              <select className="input-field" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">{t('All categories')}</option>
                {jobCategories.map((item) => (
                  <option key={item} value={item}>
                    {t(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-2 block font-medium">{t('Employment type')}</span>
              <select
                className="input-field"
                value={employmentType}
                onChange={(event) => setEmploymentType(event.target.value)}
              >
                <option value="">{t('All types')}</option>
                {employmentTypes.map((item) => (
                  <option key={item} value={item}>
                    {t(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm md:col-span-2 xl:col-span-2">
              <span className="mb-2 block font-medium">{t('Sort')}</span>
              <select className="input-field" value={sort} onChange={(event) => setSort(event.target.value)}>
                {sortOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {t(item.label)}
                  </option>
                ))}
              </select>
            </label>
          </form>

          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {t('Showing')} <strong className="text-ink">{filtered.length}</strong>{' '}
              {filtered.length === 1 ? t('listing') : t('listings')}
            </p>
            {(query || location || category || employmentType) && (
              <button
                type="button"
                className="font-display text-sm font-semibold tracking-normal text-accent"
                onClick={() => {
                  setQuery('')
                  setLocation('')
                  setCategory('')
                  setEmploymentType('')
                  setSort('newest')
                }}
              >
                {t('Clear filters')}
              </button>
            )}
          </div>

          {filtered.length ? (
            <div className="card-grid mt-8">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState
                title={t('No matching listings')}
                description={t('Try a broader search, or check back when new roles are published.')}
                actionLabel={t('View all jobs')}
                actionTo="/jobs"
              />
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
