import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { api } from '@staffora/api'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n'
import { email as emailRule, required } from '../utils/validation'

const FIELD_LABELS = {
  name: 'Company name',
  contactName: 'Contact name',
  email: 'Email',
  phone: 'Phone',
  website: 'Website',
  industry: 'Industry',
  billingAddress: 'Billing address',
  workLocations: 'Work locations',
  status: 'Status',
}

export default function CompanyDetailPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const { state, updateCompany } = useData()
  const { user } = useAuth()
  const company = state.companies.find((c) => c.id === id)
  const { push } = useToast()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(() => company ? { ...company, workLocations: (company.workLocations || []).join(', ') } : null)
  const [invite, setInvite] = useState({ name: '', email: '', password: '', role: 'Company Admin' })
  const [inviteErrors, setInviteErrors] = useState({})
  const canInvite = user?.role === 'Super Admin' || user?.role === 'Admin'
  if (!company || !form) return <EmptyState title={t('Company not found')} actionLabel={t('Back')} actionTo="/companies" />
  const requests = state.staffingRequests.filter((r) => r.companyId === id)
  const save = () => {
    updateCompany(id, { ...form, workLocations: form.workLocations.split(',').map((s) => s.trim()).filter(Boolean) })
    push({ title: t('Company updated'), message: t('Changes are saved.') })
    setEditing(false)
  }
  const provision = async (event) => {
    event.preventDefault()
    const next = {
      name: required(invite.name),
      email: required(invite.email) || emailRule(invite.email),
      password: required(invite.password, 'Enter a password') || (invite.password.length < 8 ? 'Use at least 8 characters' : ''),
    }
    setInviteErrors(next)
    if (Object.values(next).some(Boolean)) return
    try {
      await api(`/api/companies/${id}/users`, { method: 'POST', body: JSON.stringify(invite) })
      setInvite({ name: '', email: '', password: '', role: 'Company Admin' })
      push({ title: t('Employer account created'), message: t('They can sign in on the public website.') })
    } catch (error) {
      push({ title: t('Could not create account'), message: t(error.message), tone: 'error' })
    }
  }
  return (
    <div>
      <PageHeader title={company.name} description={t(company.industry)} breadcrumbs={[{ label: t('Companies'), to: '/companies' }, { label: company.name }]} actions={<Button variant="outline" onClick={() => setEditing((v) => !v)}>{editing ? t('Cancel') : t('Edit')}</Button>} />
      <div className="mb-4"><Badge tone={statusTone(company.status)}>{t(company.status)}</Badge></div>
      {editing ? (
        <div className="card-panel grid gap-3 p-5 md:grid-cols-2">
          {['name','contactName','email','phone','website','industry','billingAddress','workLocations','status'].map((key) => (
            <Field key={key} id={key} label={t(FIELD_LABELS[key])} className={key === 'billingAddress' || key === 'workLocations' ? 'md:col-span-2' : ''}>
              <input id={key} className="input-field" value={form[key] || ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </Field>
          ))}
          <div className="md:col-span-2"><Button onClick={save}>{t('Save')}</Button></div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 space-y-2 text-sm">
            <p><strong>{t('Contact:')}</strong> {company.contactName} · {company.email}</p>
            <p><strong>{t('Phone:')}</strong> {company.phone}</p>
            <p><strong>{t('Website:')}</strong> {company.website}</p>
            <p><strong>{t('Billing:')}</strong> {company.billingAddress}</p>
            <p><strong>{t('Locations:')}</strong> {(company.workLocations || []).join(', ')}</p>
          </Card>
          <Card className="space-y-2 text-sm">
            <p className="font-display text-sm font-semibold">{t('Staffing requests')}</p>
            {requests.map((r) => <Link key={r.id} className="block text-accent" to={`/staffing-requests/${r.id}`}>{r.title}</Link>)}
          </Card>
        </div>
      )}
      {canInvite ? (
        <Card className="mt-6">
          <h2 className="font-display text-lg font-semibold">{t('Employer login')}</h2>
          <p className="mt-1 text-sm text-muted">{t('Create a company admin or hiring manager. They sign in on the public website and open the employer panel.')}</p>
          <form onSubmit={provision} className="mt-4 grid gap-4 md:grid-cols-2">
            <Field id="invite-name" label={t('Name')} required error={t(inviteErrors.name)}><input id="invite-name" className="input-field" value={invite.name} onChange={(event) => setInvite((current) => ({ ...current, name: event.target.value }))} /></Field>
            <Field id="invite-email" label={t('Email')} required error={t(inviteErrors.email)}><input id="invite-email" type="email" className="input-field" value={invite.email} onChange={(event) => setInvite((current) => ({ ...current, email: event.target.value }))} /></Field>
            <Field id="invite-password" label={t('Password')} required error={t(inviteErrors.password)}><input id="invite-password" className="input-field" value={invite.password} onChange={(event) => setInvite((current) => ({ ...current, password: event.target.value }))} /></Field>
            <Field id="invite-role" label={t('Role')}><select id="invite-role" className="input-field" value={invite.role} onChange={(event) => setInvite((current) => ({ ...current, role: event.target.value }))}><option value="Company Admin">{t('Company Admin')}</option><option value="Hiring Manager">{t('Hiring Manager')}</option></select></Field>
            <div className="md:col-span-2"><Button type="submit">{t('Create employer account')}</Button></div>
          </form>
        </Card>
      ) : null}
    </div>
  )
}
