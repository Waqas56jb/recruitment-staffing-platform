import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { positiveNumber, required } from '../utils/validation'

const empty = {
  title: '', role: '', department: '', headcount: '1', employmentType: 'Temporary', skills: '',
  qualifications: '', experience: '', location: '', startDate: '', duration: '', hours: '',
  payRange: '', description: '', additional: '', priority: 'Medium', status: 'Draft',
}

export default function StaffingRequestFormPage() {
  const { id } = useParams()
  const { t } = useI18n()
  const isNew = !id || id === 'new'
  const { state, createStaffingRequest, updateStaffingRequest } = useData()
  const existing = useMemo(() => state.staffingRequests.find((r) => r.id === id), [state, id])
  const [form, setForm] = useState(() => (existing
    ? { ...existing, skills: (existing.skills || []).join(', '), headcount: String(existing.headcount) }
    : empty))
  const [errors, setErrors] = useState({})
  const { push } = useToast()
  const navigate = useNavigate()
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const save = async (status) => {
    const nextErrors = {
      title: required(form.title),
      role: required(form.role),
      headcount: positiveNumber(form.headcount),
      location: required(form.location),
      employmentType: required(form.employmentType),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    const payload = {
      ...form,
      status,
      headcount: Number(form.headcount),
      skills: String(form.skills).split(',').map((s) => s.trim()).filter(Boolean),
    }
    try {
      if (isNew || !existing) {
        const item = await createStaffingRequest(payload)
        push({ title: status === 'Draft' ? t('Draft saved') : t('Request submitted'), message: t('The request is stored for your company.') })
        navigate(`/staffing-requests/${item.id}`)
        return
      }
      await updateStaffingRequest(existing.id, payload)
      push({ title: t('Request updated'), message: t('Changes are saved.') })
      navigate(`/staffing-requests/${existing.id}`)
    } catch (error) {
      push({ title: t('Could not save request'), message: t(error.message), tone: 'error' })
    }
  }

  return (
    <div>
      <PageHeader title={isNew ? t('New staffing request') : t('Edit staffing request')} breadcrumbs={[{ label: t('Requests'), to: '/staffing-requests' }, { label: isNew ? t('New') : t('Edit') }]} />
      <div className="card-panel grid gap-4 p-5 md:grid-cols-2">
        {[
          ['title', 'Request title', true],
          ['role', 'Job role', true],
          ['department', 'Department'],
          ['headcount', 'Employees required', true],
          ['location', 'Work location', true],
          ['startDate', 'Start date'],
          ['duration', 'Expected duration'],
          ['hours', 'Working hours / shifts'],
          ['payRange', 'Pay range (optional)'],
          ['qualifications', 'Qualifications'],
          ['experience', 'Experience requirements'],
          ['skills', 'Skills (comma separated)'],
        ].map(([key, label, req]) => (
          <Field key={key} id={key} label={t(label)} required={req} error={t(errors[key])}>
            <input id={key} className="input-field" type={key === 'startDate' ? 'date' : 'text'} value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />
          </Field>
        ))}
        <Field id="employmentType" label={t('Employment type')} required error={t(errors.employmentType)}>
          <select id="employmentType" className="input-field" value={form.employmentType} onChange={(e) => set('employmentType', e.target.value)}>
            {['Temporary', 'Permanent', 'Contract'].map((o) => <option key={o} value={o}>{t(o)}</option>)}
          </select>
        </Field>
        <Field id="priority" label={t('Priority')}>
          <select id="priority" className="input-field" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            {['Low', 'Medium', 'High'].map((o) => <option key={o} value={o}>{t(o)}</option>)}
          </select>
        </Field>
        <Field id="description" label={t('Job description')} className="md:col-span-2">
          <textarea id="description" className="input-field" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </Field>
        <Field id="additional" label={t('Additional requirements')} className="md:col-span-2">
          <textarea id="additional" className="input-field" rows={3} value={form.additional} onChange={(e) => set('additional', e.target.value)} />
        </Field>
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => save('Draft')}>{t('Save draft')}</Button>
          <Button type="button" onClick={() => save('Submitted')}>{t('Submit request')}</Button>
        </div>
      </div>
    </div>
  )
}
