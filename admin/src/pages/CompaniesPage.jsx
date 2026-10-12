import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataTable from '../components/ui/DataTable'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { email as emailRule, required } from '../utils/validation'

export default function CompaniesPage() {
  const { t } = useI18n()
  const { state, createCompany } = useData()
  const { push } = useToast()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', contactName: '', email: '', phone: '', industry: '' })
  const [errors, setErrors] = useState({})
  const rows = useMemo(() => state.companies.filter((c) => !q || `${c.name} ${c.industry} ${c.contactName}`.toLowerCase().includes(q.toLowerCase())), [state.companies, q])
  const slice = rows.slice((page - 1) * 5, page * 5)
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const save = async (event) => {
    event.preventDefault()
    const next = {
      name: required(form.name),
      email: required(form.email) || emailRule(form.email),
      contactName: required(form.contactName),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    try {
      await createCompany({ ...form, status: 'Active', workLocations: [], website: '', billingAddress: '' })
      setForm({ name: '', contactName: '', email: '', phone: '', industry: '' })
      setOpen(false)
      push({ title: t('Company saved'), message: t('You can now publish jobs and provision an employer login.') })
    } catch (error) {
      push({ title: t('Could not create company'), message: t(error.message), tone: 'error' })
    }
  }

  return (
    <div>
      <PageHeader title={t('Companies')} description={t('Employer organisations stored in Staffora.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Companies') }]} actions={<Button onClick={() => setOpen((value) => !value)}>{open ? t('Close') : t('New company')}</Button>} />
      {open ? (
        <Card className="mb-6">
          <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
            <Field id="name" label={t('Company name')} required error={t(errors.name)}><input id="name" className="input-field" value={form.name} onChange={(event) => set('name', event.target.value)} /></Field>
            <Field id="contactName" label={t('Contact')} required error={t(errors.contactName)}><input id="contactName" className="input-field" value={form.contactName} onChange={(event) => set('contactName', event.target.value)} /></Field>
            <Field id="email" label={t('Email')} required error={t(errors.email)}><input id="email" type="email" className="input-field" value={form.email} onChange={(event) => set('email', event.target.value)} /></Field>
            <Field id="phone" label={t('Phone')}><input id="phone" className="input-field" value={form.phone} onChange={(event) => set('phone', event.target.value)} /></Field>
            <Field id="industry" label={t('Industry')}><input id="industry" className="input-field" value={form.industry} onChange={(event) => set('industry', event.target.value)} /></Field>
            <div className="md:col-span-2"><Button type="submit">{t('Save company')}</Button></div>
          </form>
        </Card>
      ) : null}
      <input className="input-field mb-4 max-w-md" placeholder={t('Search companies')} aria-label={t('Search companies')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable rows={slice} columns={[
        { key: 'name', label: t('Company'), render: (c) => <Link className="font-medium hover:text-accent" to={`/companies/${c.id}`}>{c.name}</Link> },
        { key: 'industry', label: t('Industry'), render: (c) => t(c.industry) },
        { key: 'contactName', label: t('Contact') },
        { key: 'status', label: t('Status'), render: (c) => <Badge tone={statusTone(c.status)}>{t(c.status)}</Badge> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
