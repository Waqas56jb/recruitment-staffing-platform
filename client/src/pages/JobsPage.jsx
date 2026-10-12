import { useEffect, useMemo, useState } from 'react'
import { api } from '@staffora/api'
import JobCard from '../components/cards/JobCard'
import PageHero from '../components/sections/PageHero'
import EmptyState from '../components/ui/EmptyState'
import Container from '../components/ui/Container'
import { images } from '../data/images'
import { employmentTypes, jobCategories } from '../data/jobs'
import { usePageMeta } from '../hooks/usePageMeta'

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title-asc', label: 'Title A–Z' },
  { value: 'title-desc', label: 'Title Z–A' },
]

export default function JobsPage() {
  usePageMeta({
    title: 'Jobs',
    description: 'Browse published Staffora vacancies. Filter by location, category, and employment type.',
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
        eyebrow="Careers"
        title="Find your next opportunity"
        description="Published roles from Staffora. Use the filters to narrow the list."
        image={images.office}
      />

      <section className="section-pad bg-cream">
        <Container>
          <form
            className="card-shell grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-5"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="block text-sm xl:col-span-2">
              <span className="mb-2 block font-medium">Search</span>
              <input
                className="input-field"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Role, keyword, department"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block font-medium">Location</span>
              <select className="input-field" value={location} onChange={(event) => setLocation(event.target.value)}>
                <option value="">All locations</option>
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-2 block font-medium">Category</span>
              <select className="input-field" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">All categories</option>
                {jobCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-2 block font-medium">Employment type</span>
              <select
                className="input-field"
                value={employmentType}
                onChange={(event) => setEmploymentType(event.target.value)}
              >
                <option value="">All types</option>
                {employmentTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm md:col-span-2 xl:col-span-2">
              <span className="mb-2 block font-medium">Sort</span>
              <select className="input-field" value={sort} onChange={(event) => setSort(event.target.value)}>
                {sortOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </form>

          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="text-sm text-muted">
              Showing <strong className="text-ink">{filtered.length}</strong> listing
              {filtered.length === 1 ? '' : 's'}
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
                Clear filters
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
                title="No matching listings"
                description="Try a broader search, or check back when new roles are published."
                actionLabel="View all jobs"
                actionTo="/jobs"
              />
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
