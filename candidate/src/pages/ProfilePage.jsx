import { useState } from 'react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { email as emailRule, required } from '../utils/validation'

export default function ProfilePage() {
  const { state, updateCandidate } = useData()
  const candidate = state.candidates.find((c) => c.id === state.candidateProfileId)
  const { push } = useToast()
  const [form, setForm] = useState(() => ({
    fullName: candidate?.fullName || '',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    city: candidate?.city || '',
    headline: candidate?.headline || '',
    bio: candidate?.bio || '',
    skills: (candidate?.skills || []).join(', '),
    desiredRole: candidate?.preferences?.desiredRole || '',
    salaryExpectation: candidate?.preferences?.salaryExpectation || '',
    availabilityDate: candidate?.preferences?.availabilityDate || '',
    visibility: candidate?.visibility || 'Visible to recruiters',
  }))
  const [errors, setErrors] = useState({})
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  if (!candidate) return <Card>Demo candidate profile not found.</Card>

  const save = (e) => {
    e.preventDefault()
    const next = {
      fullName: required(form.fullName),
      email: required(form.email) || emailRule(form.email),
      headline: required(form.headline),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    updateCandidate(candidate.id, {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      city: form.city,
      headline: form.headline,
      bio: form.bio,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      visibility: form.visibility,
      preferences: {
        ...candidate.preferences,
        desiredRole: form.desiredRole,
        salaryExpectation: form.salaryExpectation,
        availabilityDate: form.availabilityDate,
      },
    })
    push({ title: 'Profile saved', message: 'Your details are updated.' })
  }

  return (
    <div>
      <PageHeader title="Profile" description="Details stored on your candidate record." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Profile' }]} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone="gold">{candidate.status}</Badge>
        <Badge tone="cream">{form.visibility}</Badge>
      </div>
      <form onSubmit={save} className="card-panel grid gap-4 p-5 md:grid-cols-2">
        {[
          ['fullName', 'Full name', true],
          ['email', 'Email', true],
          ['phone', 'Phone'],
          ['city', 'City'],
          ['headline', 'Headline', true],
          ['desiredRole', 'Desired role'],
          ['salaryExpectation', 'Salary expectation'],
          ['availabilityDate', 'Availability date', false, 'date'],
        ].map(([key, label, req, type]) => (
          <Field key={key} id={key} label={label} required={req} error={errors[key]}>
            <input id={key} type={type || 'text'} className="input-field" value={form[key]} onChange={(e) => set(key, e.target.value)} />
          </Field>
        ))}
        <Field id="skills" label="Skills (comma separated)" className="md:col-span-2">
          <input id="skills" className="input-field" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
        </Field>
        <Field id="bio" label="Bio" className="md:col-span-2">
          <textarea id="bio" className="input-field" rows={4} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
        </Field>
        <Field id="visibility" label="Visibility">
          <select id="visibility" className="input-field" value={form.visibility} onChange={(e) => set('visibility', e.target.value)}>
            <option>Visible to recruiters</option>
            <option>Hidden from search</option>
          </select>
        </Field>
        <div className="md:col-span-2">
          <Button type="submit">Save profile</Button>
        </div>
      </form>
    </div>
  )
}
