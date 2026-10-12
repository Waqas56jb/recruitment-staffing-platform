import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { positiveNumber, required } from '../utils/validation'

export default function InvoiceFormPage() {
  const { state, createInvoice } = useData()
  const { push } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ companyId: '', issueDate: new Date().toISOString().slice(0, 10), dueDate: '', engagementLabel: '', description: '', quantity: '1', unitRate: '100', status: 'Draft' })
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  useEffect(() => {
    if (!form.companyId && state.companies[0]) set('companyId', state.companies[0].id)
  }, [form.companyId, state.companies])
  const save = async (status) => {
    const next = { companyId: required(form.companyId), engagementLabel: required(form.engagementLabel), dueDate: required(form.dueDate), quantity: positiveNumber(form.quantity), unitRate: positiveNumber(form.unitRate) }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    try {
      const item = await createInvoice({
        companyId: form.companyId,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        engagementLabel: form.engagementLabel,
        lineItems: [{ description: form.description || form.engagementLabel, quantity: Number(form.quantity), unitRate: Number(form.unitRate) }],
        status,
      })
      push({ title: 'Invoice saved', message: 'It is stored for this company.' })
      navigate(`/invoices/${item.id}`)
    } catch (error) {
      push({ title: 'Could not create invoice', message: error.message, tone: 'error' })
    }
  }
  return (
    <div>
      <PageHeader title="New invoice" breadcrumbs={[{ label: 'Invoices', to: '/invoices' }, { label: 'New' }]} />
      <form className="card-panel grid gap-4 p-5 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save('Draft') }}>
        <Field id="companyId" label="Company" required error={errors.companyId}><select id="companyId" className="input-field" value={form.companyId} onChange={(e) => set('companyId', e.target.value)}>{state.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field id="engagementLabel" label="Engagement" required error={errors.engagementLabel}><input id="engagementLabel" className="input-field" value={form.engagementLabel} onChange={(e) => set('engagementLabel', e.target.value)} /></Field>
        <Field id="issueDate" label="Issue date"><input id="issueDate" type="date" className="input-field" value={form.issueDate} onChange={(e) => set('issueDate', e.target.value)} /></Field>
        <Field id="dueDate" label="Due date" required error={errors.dueDate}><input id="dueDate" type="date" className="input-field" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} /></Field>
        <Field id="description" label="Line description" className="md:col-span-2"><input id="description" className="input-field" value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
        <Field id="quantity" label="Quantity" required error={errors.quantity}><input id="quantity" className="input-field" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} /></Field>
        <Field id="unitRate" label="Unit rate" required error={errors.unitRate}><input id="unitRate" className="input-field" value={form.unitRate} onChange={(e) => set('unitRate', e.target.value)} /></Field>
        <div className="md:col-span-2 flex gap-2">
          <Button type="button" variant="outline" onClick={() => save('Draft')}>Save draft</Button>
          <Button type="button" onClick={() => save('Issued')}>Issue</Button>
        </div>
      </form>
    </div>
  )
}
