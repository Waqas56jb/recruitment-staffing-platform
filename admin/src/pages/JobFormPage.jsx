import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { required } from '../utils/validation'

const empty = { title: '', companyId: '', location: '', employmentType: 'Temporary', category: 'Logistics', skills: '', experienceLevel: 'Entry', salaryLabel: '', description: '', responsibilities: '', requirements: '', status: 'Draft' }

export default function JobFormPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const { state, createJob, updateJob } = useData()
  const existing = useMemo(() => state.jobs.find((j) => j.id === id), [state.jobs, id])
  const [form, setForm] = useState(() => existing ? { ...existing, skills: (existing.skills || []).join(', '), responsibilities: (existing.responsibilities || []).join('\n'), requirements: (existing.requirements || []).join('\n') } : empty)
  const [errors, setErrors] = useState({})
  const { push } = useToast()
  const navigate = useNavigate()
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  useEffect(() => {
    if (!form.companyId && state.companies[0]) set('companyId', state.companies[0].id)
  }, [form.companyId, state.companies])
  const save = async (status) => {
    const next = { title: required(form.title), companyId: required(form.companyId), location: required(form.location) }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    const payload = {
      ...form, status,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      responsibilities: form.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean),
      requirements: form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
      isSample: false,
    }
    try {
      if (isNew || !existing) {
        const item = await createJob(payload)
        push({ title: 'Job saved', message: status === 'Published' ? 'This role is on the public board.' : 'Draft saved.' })
        navigate(`/jobs/${item.id}`)
      } else {
        await updateJob(existing.id, payload)
        push({ title: 'Job updated', message: 'The listing is saved.' })
        navigate(`/jobs/${existing.id}`)
      }
    } catch (error) {
      push({ title: 'Could not save job', message: error.message, tone: 'error' })
    }
  }
  return (
    <div>
      <PageHeader title={isNew ? 'New job' : 'Edit job'} breadcrumbs={[{ label: 'Jobs', to: '/jobs' }, { label: isNew ? 'New' : 'Edit' }]} />
      <form className="card-panel grid gap-4 p-5 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save(form.status) }}>
        <Field id="title" label="Title" required error={errors.title}><input id="title" className="input-field" value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field id="companyId" label="Company" required error={errors.companyId}>
          <select id="companyId" className="input-field" value={form.companyId} onChange={(e) => set('companyId', e.target.value)}>
            {state.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            {state.companies.length ? null : <option value="">Create a company first</option>}
          </select>
        </Field>
        <Field id="location" label="Location" required error={errors.location}><input id="location" className="input-field" value={form.location} onChange={(e) => set('location', e.target.value)} /></Field>
        <Field id="employmentType" label="Employment type"><select id="employmentType" className="input-field" value={form.employmentType} onChange={(e) => set('employmentType', e.target.value)}><option>Temporary</option><option>Permanent</option><option>Contract</option></select></Field>
        <Field id="category" label="Category"><input id="category" className="input-field" value={form.category} onChange={(e) => set('category', e.target.value)} /></Field>
        <Field id="salaryLabel" label="Salary label"><input id="salaryLabel" className="input-field" value={form.salaryLabel} onChange={(e) => set('salaryLabel', e.target.value)} /></Field>
        <Field id="skills" label="Skills (comma separated)" className="md:col-span-2"><input id="skills" className="input-field" value={form.skills} onChange={(e) => set('skills', e.target.value)} /></Field>
        <Field id="description" label="Description" className="md:col-span-2"><textarea id="description" className="input-field" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
        <Field id="responsibilities" label="Responsibilities (one per line)" className="md:col-span-2"><textarea id="responsibilities" className="input-field" rows={3} value={form.responsibilities} onChange={(e) => set('responsibilities', e.target.value)} /></Field>
        <Field id="requirements" label="Requirements (one per line)" className="md:col-span-2"><textarea id="requirements" className="input-field" rows={3} value={form.requirements} onChange={(e) => set('requirements', e.target.value)} /></Field>
        <div className="md:col-span-2 flex gap-2">
          <Button type="button" variant="outline" onClick={() => save('Draft')}>Save draft</Button>
          <Button type="button" onClick={() => save('Published')}>Publish</Button>
        </div>
      </form>
    </div>
  )
}
