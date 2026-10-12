import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Field from '../components/ui/Field'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { required } from '../utils/validation'

export default function JobDetailPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const { state, createApplication, toggleSavedJob } = useData()
  const { push } = useToast()
  const navigate = useNavigate()
  const job = state.jobs.find((j) => j.id === id)
  const company = state.companies.find((c) => c.id === job?.companyId)
  const existing = state.applications.find((a) => a.candidateId === state.candidateProfileId && a.jobId === id && a.status !== 'Withdrawn')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ coverLetter: '', availability: '', experienceSummary: '' })
  const [errors, setErrors] = useState({})

  if (!job || job.status !== 'Published') {
    return <EmptyState title={t('Job not available')} description={t('This listing is not published in the demo.')} actionLabel={t('Back to jobs')} actionTo="/jobs" />
  }

  const submit = async () => {
    const next = {
      coverLetter: required(form.coverLetter),
      availability: required(form.availability),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    try {
      const app = await createApplication({
        candidateId: state.candidateProfileId,
        jobId: job.id,
        status: 'Submitted',
        coverLetter: form.coverLetter,
        availability: form.availability,
        experienceSummary: form.experienceSummary,
        additional: '',
      })
      push({ title: t('Application submitted'), message: t('The agency can see it on the recruitment board.') })
      setOpen(false)
      navigate(`/applications/${app.id}`)
    } catch (err) {
      push({ title: t('Could not apply'), message: t(err.message), tone: 'error' })
    }
  }

  return (
    <div>
      <PageHeader
        title={job.title}
        description={`${job.location} · ${t(job.employmentType)}`}
        breadcrumbs={[{ label: t('Jobs'), to: '/jobs' }, { label: job.title }]}
        actions={(
          <>
            <Button variant="outline" onClick={() => toggleSavedJob(job.id)}>{state.savedJobIds.includes(job.id) ? t('Unsave') : t('Save job')}</Button>
            {existing ? <Button to={`/applications/${existing.id}`}>{t('View application')}</Button> : <Button onClick={() => setOpen(true)}>{t('Apply')}</Button>}
          </>
        )}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {job.isSample ? <Badge tone="gold">{t('Sample listing')}</Badge> : null}
        <Badge tone="cream">{t(job.category)}</Badge>
        <Badge tone="muted">{job.salaryLabel}</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-4 text-sm">
          <p>{job.description}</p>
          <div>
            <p className="font-display text-sm font-semibold">{t('Responsibilities')}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">{(job.responsibilities || []).map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
          <div>
            <p className="font-display text-sm font-semibold">{t('Requirements')}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">{(job.requirements || []).map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
        </Card>
        <Card className="space-y-3 text-sm">
          <p><strong>{t('Employer:')}</strong> {company?.name || t('Confidential')}</p>
          <p><strong>{t('Experience:')}</strong> {t(job.experienceLevel)}</p>
          <p><strong>{t('Skills:')}</strong> {(job.skills || []).join(', ')}</p>
          <Link to="/jobs" className="block text-xs font-semibold text-accent">{t('More jobs')}</Link>
        </Card>
      </div>

      <Modal
        open={open}
        title={t('Apply (demo)')}
        onClose={() => setOpen(false)}
        footer={(
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>{t('Cancel')}</Button>
            <Button onClick={submit}>{t('Submit application')}</Button>
          </>
        )}
      >
        <p className="mb-4 text-sm text-muted">{t('Your application is saved to Staffora.')}</p>
        <div className="space-y-3">
          <Field id="cover" label={t('Cover letter')} required error={t(errors.coverLetter)}>
            <textarea id="cover" className="input-field" rows={4} value={form.coverLetter} onChange={(e) => setForm((f) => ({ ...f, coverLetter: e.target.value }))} />
          </Field>
          <Field id="avail" label={t('Availability')} required error={t(errors.availability)}>
            <input id="avail" className="input-field" value={form.availability} onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))} />
          </Field>
          <Field id="exp" label={t('Experience summary')}>
            <input id="exp" className="input-field" value={form.experienceSummary} onChange={(e) => setForm((f) => ({ ...f, experienceSummary: e.target.value }))} />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
