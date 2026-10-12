import { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { email as emailRule, required } from '../utils/validation'

export default function CompanyPage() {
  const { state, updateCompany } = useData()
  const company = state.companies.find((c) => c.id === state.companyId)
  const { push } = useToast()
  const [form, setForm] = useState(() => ({
    name: company?.name || '',
    contactName: company?.contactName || '',
    email: company?.email || '',
    phone: company?.phone || '',
    website: company?.website || '',
    industry: company?.industry || '',
    billingAddress: company?.billingAddress || '',
    workLocations: (company?.workLocations || []).join(', '),
  }))
  const [errors, setErrors] = useState({})
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  if (!company) return <Card>No company is linked to this account yet.</Card>

  const save = (e) => {
    e.preventDefault()
    const next = {
      name: required(form.name),
      contactName: required(form.contactName),
      email: required(form.email) || emailRule(form.email),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    updateCompany(company.id, {
      ...form,
      workLocations: form.workLocations.split(',').map((s) => s.trim()).filter(Boolean),
    })
    push({ title: 'Company saved', message: 'Organisation details are updated.' })
  }

  return (
    <div>
      <PageHeader title="Company profile" description="Organisation details stored for your company." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Company' }]} />
      <form onSubmit={save} className="card-panel grid gap-4 p-5 md:grid-cols-2">
        {[
          ['name', 'Company name', true],
          ['contactName', 'Primary contact', true],
          ['email', 'Email', true],
          ['phone', 'Phone'],
          ['website', 'Website'],
          ['industry', 'Industry'],
          ['billingAddress', 'Billing address'],
          ['workLocations', 'Work locations (comma separated)'],
        ].map(([key, label, req]) => (
          <Field key={key} id={key} label={label} required={req} error={errors[key]} className={key === 'billingAddress' || key === 'workLocations' ? 'md:col-span-2' : ''}>
            <input id={key} className="input-field" value={form[key]} onChange={(e) => set(key, e.target.value)} />
          </Field>
        ))}
        <div className="md:col-span-2">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  )
}
