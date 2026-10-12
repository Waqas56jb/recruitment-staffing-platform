import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'

export default function JobsPage() {
  const { t } = useI18n()
  const { state, toggleSavedJob } = useData()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState('')
  const categories = [...new Set(state.jobs.map((j) => j.category))]
  const rows = useMemo(() => {
    return state.jobs
      .filter((j) => j.status === 'Published')
      .filter((j) => !category || j.category === category)
      .filter((j) => !type || j.employmentType === type)
      .filter((j) => !q || `${j.title} ${j.location} ${j.skills.join(' ')}`.toLowerCase().includes(q.toLowerCase()))
  }, [state.jobs, q, category, type])

  return (
    <div>
      <PageHeader title={t('Find jobs')} description={t('Published roles you can apply to.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Jobs') }]} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input className="input-field" placeholder={t('Search title, skills, location')} aria-label={t('Search title, skills, location')} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} aria-label={t('Category')}>
          <option value="">{t('All categories')}</option>
          {categories.map((c) => <option key={c} value={c}>{t(c)}</option>)}
        </select>
        <select className="input-field" value={type} onChange={(e) => setType(e.target.value)} aria-label={t('Employment type')}>
          <option value="">{t('All employment types')}</option>
          {['Temporary', 'Permanent', 'Contract'].map((value) => <option key={value} value={value}>{t(value)}</option>)}
        </select>
      </div>
      {!rows.length ? <EmptyState title={t('No matching jobs')} description={t('Try clearing filters.')} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((job) => {
            const saved = state.savedJobIds.includes(job.id)
            return (
              <Card key={job.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/jobs/${job.id}`} className="font-display text-xl font-semibold hover:text-accent">{job.title}</Link>
                    <p className="text-sm text-muted">{job.location} · {t(job.employmentType)}</p>
                  </div>
                  {job.isSample ? <Badge tone="gold">{t('Sample')}</Badge> : null}
                </div>
                <p className="text-sm text-muted line-clamp-2">{job.description}</p>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button to={`/jobs/${job.id}`} size="sm">{t('View role')}</Button>
                  <Button size="sm" variant="outline" onClick={() => toggleSavedJob(job.id)}>{saved ? t('Unsave') : t('Save')}</Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
