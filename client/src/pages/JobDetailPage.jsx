import { Link, useParams } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import JobCard from '../components/cards/JobCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import EmptyState from '../components/ui/EmptyState'
import { getJobById, getRelatedJobs } from '../data/jobs'
import { formatDate } from '../utils/format'
import { usePageMeta } from '../hooks/usePageMeta'

export default function JobDetailPage() {
  const { id } = useParams()
  const job = getJobById(id)

  usePageMeta({
    title: job ? job.title : 'Job not found',
    description: job
      ? `${job.title} — ${job.location}. Sample listing for demonstration purposes.`
      : 'The requested job listing could not be found.',
  })

  if (!job) {
    return (
      <section className="section-pad bg-cream pt-36">
        <Container>
          <EmptyState
            title="Job not found"
            description="This sample listing does not exist or may have been removed."
            actionLabel="Back to jobs"
            actionTo="/jobs"
          />
        </Container>
      </section>
    )
  }

  const related = getRelatedJobs(job)

  return (
    <>
      <section className="bg-ink pt-32 text-cream">
        <Container className="pb-14">
          <p className="text-sm text-cream/60">
            <Link to="/jobs" className="hover:text-cream">
              Jobs
            </Link>{' '}
            / {job.title}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {job.isSample ? <Badge tone="gold">Sample Listing</Badge> : null}
            <Badge tone="soft">{job.employmentType}</Badge>
            <Badge tone="soft">{job.category}</Badge>
          </div>
          <h1 className="display-xl mt-5">{job.title}</h1>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-cream/75">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden />
              {job.location}
            </span>
            <span>{job.department}</span>
            <span>{job.salaryLabel}</span>
            <span>Posted {formatDate(job.postedAt)}</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/candidates#interest">Apply / register interest</Button>
            <Button to="/jobs" variant="lightOutline">
              More jobs
            </Button>
          </div>
        </Container>
      </section>

      <section className="section-pad bg-cream">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-10">
              <div>
                <h2 className="display-md">About the role</h2>
                <p className="mt-4 leading-relaxed text-muted">{job.description}</p>
              </div>
              <div>
                <h2 className="display-md">Responsibilities</h2>
                <ul className="mt-4 space-y-2 text-muted">
                  {job.responsibilities.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="display-md">Requirements</h2>
                <ul className="mt-4 space-y-2 text-muted">
                  {job.requirements.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h2 className="font-display text-xl font-bold tracking-tight">
                Application instructions
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                This is a sample listing. To express interest in similar roles, submit the candidate
                form. Live applications, CV delivery, and employer routing require backend integration.
              </p>
              <div className="mt-6">
                <Button to="/candidates#interest" className="w-full">
                  Register interest
                </Button>
              </div>
              <div className="mt-3">
                <Button to="/contact" variant="ghost" className="w-full">
                  Ask a question
                </Button>
              </div>
            </aside>
          </div>

          {related.length ? (
            <div className="mt-16">
              <h2 className="display-md">Related sample roles</h2>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {related.map((item) => (
                  <JobCard key={item.id} job={item} />
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    </>
  )
}
