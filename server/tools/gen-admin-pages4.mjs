import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve('admin/src/pages')
const w = (name, content) => { fs.writeFileSync(path.join(root, name), content); console.log('wrote', name) }

w('TimesheetsPage.jsx', `import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function TimesheetsPage() {
  const { state } = useData()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.timesheets.filter((t) => !status || t.status === status).sort((a, b) => b.weekEnding.localeCompare(a.weekEnding)), [state.timesheets, status])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title="Timesheets" description="Agency review of submitted hours across clients." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Timesheets' }]} />
      <select className="input-field mb-4 max-w-xs" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
        <option value="">All statuses</option>
        {['Draft','Submitted','Approved','Rejected'].map((s) => <option key={s}>{s}</option>)}
      </select>
      <DataTable rows={slice} columns={[
        { key: 'weekEnding', label: 'Week ending', render: (t) => <Link className="font-medium hover:text-accent" to={\`/timesheets/\${t.id}\`}>{formatDate(t.weekEnding)}</Link> },
        { key: 'worker', label: 'Worker', render: (t) => state.workers.find((w) => w.id === t.workerId)?.displayName },
        { key: 'company', label: 'Company', render: (t) => state.companies.find((c) => c.id === t.companyId)?.name },
        { key: 'totalHours', label: 'Hours' },
        { key: 'status', label: 'Status', render: (t) => <Badge tone={statusTone(t.status)}>{t.status}</Badge> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
`)

w('TimesheetDetailPage.jsx', `import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { formatDate, formatDateTime } from '../utils/format'
import { required } from '../utils/validation'

export default function TimesheetDetailPage() {
  const { id } = useParams()
  const { state, updateTimesheet } = useData()
  const { push } = useToast()
  const timesheet = state.timesheets.find((t) => t.id === id)
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  if (!timesheet) return <EmptyState title="Timesheet not found" actionLabel="Back" actionTo="/timesheets" />
  const worker = state.workers.find((w) => w.id === timesheet.workerId)
  const canReview = timesheet.status === 'Submitted'
  return (
    <div>
      <PageHeader title={\`Week ending \${formatDate(timesheet.weekEnding)}\`} description={worker?.displayName} breadcrumbs={[{ label: 'Timesheets', to: '/timesheets' }, { label: formatDate(timesheet.weekEnding) }]}
        actions={canReview ? (<><Button variant="outline" onClick={() => setConfirmApprove(true)}>Approve</Button><Button variant="danger" onClick={() => { setReason(''); setReasonError(''); setConfirmReject(true) }}>Reject</Button></>) : null} />
      <div className="mb-4"><Badge tone={statusTone(timesheet.status)}>{timesheet.status}</Badge></div>
      <Card className="space-y-2 text-sm">
        <p><strong>Regular / OT / Breaks:</strong> {timesheet.regularHours} / {timesheet.overtimeHours} / {timesheet.breakHours}</p>
        <p><strong>Total:</strong> {timesheet.totalHours}</p>
        <p><strong>Submitted:</strong> {formatDateTime(timesheet.submittedAt)}</p>
        {timesheet.rejectionReason ? <p className="text-accent"><strong>Reason:</strong> {timesheet.rejectionReason}</p> : null}
        <p className="text-xs text-muted">Approvals update demo state only — payroll systems are not notified.</p>
      </Card>
      <ConfirmDialog open={confirmApprove} title="Approve timesheet?" message="Local demo state only." confirmLabel="Approve" onClose={() => setConfirmApprove(false)} onConfirm={() => { updateTimesheet(id, { status: 'Approved', reviewedAt: new Date().toISOString(), rejectionReason: '' }); push({ title: 'Approved locally', message: 'Demo state updated.' }); setConfirmApprove(false) }} />
      <ConfirmDialog open={confirmReject} title="Reject timesheet?" message="Provide a reason. Local demo only." confirmLabel="Reject" tone="danger" onClose={() => setConfirmReject(false)} onConfirm={() => { const err = required(reason, 'Reason required'); setReasonError(err || ''); if (err) return; updateTimesheet(id, { status: 'Rejected', reviewedAt: new Date().toISOString(), rejectionReason: reason.trim() }); push({ title: 'Rejected locally', message: 'Demo state updated.' }); setConfirmReject(false) }}>
        <Field id="reason" label="Rejection reason" required error={reasonError} className="mt-4"><textarea id="reason" className="input-field" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </ConfirmDialog>
    </div>
  )
}
`)

w('DocumentsPage.jsx', `import { useMemo, useState } from 'react'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function DocumentsPage() {
  const { state } = useData()
  const { push } = useToast()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.documents.filter((d) => !q || \`\${d.title} \${d.category}\`.toLowerCase().includes(q.toLowerCase())), [state.documents, q])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title="Documents" description="Agency document register (metadata only)." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Documents' }]} />
      <input className="input-field mb-4 max-w-md" placeholder="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable rows={slice} columns={[
        { key: 'title', label: 'Document' },
        { key: 'category', label: 'Category' },
        { key: 'company', label: 'Company', render: (d) => state.companies.find((c) => c.id === d.companyId)?.name || '—' },
        { key: 'issuedAt', label: 'Issued', render: (d) => formatDate(d.issuedAt) },
        { key: 'status', label: 'Status', render: (d) => <Badge tone={statusTone(d.status)}>{d.status}</Badge> },
        { key: 'a', label: '', render: () => <Button size="sm" variant="outline" onClick={() => push({ title: 'Download simulated', message: 'No file transferred.' })}>Download</Button> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
`)

w('PayrollPage.jsx', `import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDate, formatMoney } from '../utils/format'

export default function PayrollPage() {
  const { state } = useData()
  return (
    <div>
      <PageHeader title="Payroll" description="Estimated payroll periods for demonstration. Not a live payroll run." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Payroll' }]} />
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {state.payrollPeriods.map((p) => (
          <Card key={p.id} className="space-y-2">
            <div className="flex justify-between"><Link className="font-display text-lg font-bold uppercase hover:text-accent" to={\`/payroll/\${p.id}\`}>{p.label}</Link><Badge tone={statusTone(p.status)}>{p.status}</Badge></div>
            <p className="text-sm text-muted">{formatDate(p.startDate)} – {formatDate(p.endDate)}</p>
          </Card>
        ))}
      </div>
      <h2 className="mb-3 font-display text-lg font-bold uppercase">Entries</h2>
      <DataTable rows={state.payrollEntries} columns={[
        { key: 'worker', label: 'Worker', render: (e) => state.workers.find((w) => w.id === e.workerId)?.displayName },
        { key: 'periodId', label: 'Period', render: (e) => <Link className="text-accent" to={\`/payroll/\${e.periodId}\`}>{e.periodId}</Link> },
        { key: 'gross', label: 'Gross', render: (e) => formatMoney(e.gross) },
        { key: 'net', label: 'Net', render: (e) => formatMoney(e.net) },
        { key: 'status', label: 'Status', render: (e) => <Badge tone={statusTone(e.status)}>{e.status}</Badge> },
      ]} />
    </div>
  )
}
`)

w('PayrollDetailPage.jsx', `import { useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { formatDate, formatMoney } from '../utils/format'

export default function PayrollDetailPage() {
  const { id } = useParams()
  const { state, updatePayrollEntry } = useData()
  const { push } = useToast()
  const period = state.payrollPeriods.find((p) => p.id === id)
  if (!period) return <EmptyState title="Period not found" actionLabel="Back" actionTo="/payroll" />
  const entries = state.payrollEntries.filter((e) => e.periodId === id)
  return (
    <div>
      <PageHeader title={period.label} description={\`\${formatDate(period.startDate)} – \${formatDate(period.endDate)}\`} breadcrumbs={[{ label: 'Payroll', to: '/payroll' }, { label: period.label }]} />
      <div className="mb-4"><Badge tone={statusTone(period.status)}>{period.status}</Badge></div>
      <Card className="mb-4 text-sm text-muted">These figures are demo estimates. No salaries are calculated for tax or paid.</Card>
      <DataTable rows={entries} columns={[
        { key: 'worker', label: 'Worker', render: (e) => state.workers.find((w) => w.id === e.workerId)?.displayName },
        { key: 'regularHours', label: 'Regular' },
        { key: 'overtimeHours', label: 'OT' },
        { key: 'gross', label: 'Gross', render: (e) => formatMoney(e.gross) },
        { key: 'net', label: 'Net', render: (e) => formatMoney(e.net) },
        { key: 'status', label: 'Status', render: (e) => <Badge tone={statusTone(e.status)}>{e.status}</Badge> },
        { key: 'a', label: '', render: (e) => e.status === 'Pending Review' ? <Button size="sm" onClick={() => { updatePayrollEntry(e.id, { status: 'Approved' }); push({ title: 'Entry approved locally', message: 'No payroll provider was contacted.' }) }}>Approve</Button> : null },
      ]} />
    </div>
  )
}
`)

w('InvoicesPage.jsx', `import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDate, formatMoney } from '../utils/format'

export default function InvoicesPage() {
  const { state } = useData()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.invoices.filter((i) => !status || i.status === status), [state.invoices, status])
  const slice = rows.slice((page - 1) * 5, page * 5)
  return (
    <div>
      <PageHeader title="Invoices" description="Client billing records in the demo ledger." actions={<Button to="/invoices/new">New invoice</Button>} breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Invoices' }]} />
      <select className="input-field mb-4 max-w-xs" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
        <option value="">All statuses</option>
        {['Draft','Issued','Partially Paid','Paid','Overdue'].map((s) => <option key={s}>{s}</option>)}
      </select>
      <DataTable rows={slice} columns={[
        { key: 'number', label: 'Invoice', render: (i) => <Link className="font-medium hover:text-accent" to={\`/invoices/\${i.id}\`}>{i.number}</Link> },
        { key: 'company', label: 'Company', render: (i) => state.companies.find((c) => c.id === i.companyId)?.name },
        { key: 'issueDate', label: 'Issued', render: (i) => formatDate(i.issueDate) },
        { key: 'total', label: 'Total', render: (i) => formatMoney(i.total) },
        { key: 'status', label: 'Status', render: (i) => <Badge tone={statusTone(i.status)}>{i.status}</Badge> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
`)

w('InvoiceFormPage.jsx', `import { useState } from 'react'
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
  const [form, setForm] = useState({ companyId: 'co-northline', issueDate: new Date().toISOString().slice(0, 10), dueDate: '', engagementLabel: '', description: '', quantity: '1', unitRate: '100', status: 'Draft' })
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const save = (status) => {
    const next = { companyId: required(form.companyId), engagementLabel: required(form.engagementLabel), dueDate: required(form.dueDate), quantity: positiveNumber(form.quantity), unitRate: positiveNumber(form.unitRate) }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    const item = createInvoice({
      companyId: form.companyId,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      engagementLabel: form.engagementLabel,
      lineItems: [{ description: form.description || form.engagementLabel, quantity: Number(form.quantity), unitRate: Number(form.unitRate) }],
      status,
    })
    push({ title: 'Invoice created locally', message: 'No billing email was sent.' })
    navigate(\`/invoices/\${item.id}\`)
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
`)

w('InvoiceDetailPage.jsx', `import { useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { formatDate, formatMoney } from '../utils/format'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const { state, updateInvoice } = useData()
  const { push } = useToast()
  const invoice = state.invoices.find((i) => i.id === id)
  if (!invoice) return <EmptyState title="Invoice not found" actionLabel="Back" actionTo="/invoices" />
  const company = state.companies.find((c) => c.id === invoice.companyId)
  return (
    <div>
      <PageHeader title={invoice.number} description={invoice.engagementLabel} breadcrumbs={[{ label: 'Invoices', to: '/invoices' }, { label: invoice.number }]}
        actions={(
          <>
            <Button variant="outline" onClick={() => window.print()}>Print</Button>
            {invoice.status !== 'Paid' ? <Button onClick={() => { updateInvoice(id, { status: 'Paid' }); push({ title: 'Marked paid locally', message: 'No payment was collected.' }) }}>Mark paid</Button> : null}
          </>
        )} />
      <div className="mb-4"><Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge></div>
      <Card className="space-y-4 p-6" id="invoice-print">
        <div className="flex justify-between"><div><p className="font-display text-2xl font-extrabold uppercase">Staffora</p><p className="text-sm text-muted">Demo invoice — not a tax document</p></div><div className="text-sm text-right"><p>Issue {formatDate(invoice.issueDate)}</p><p>Due {formatDate(invoice.dueDate)}</p></div></div>
        <p className="text-sm"><strong>Bill to:</strong> {company?.name}<br />{company?.billingAddress}</p>
        <div className="table-wrap"><table className="min-w-full text-sm"><thead className="bg-cream/70 text-xs uppercase text-muted"><tr><th className="px-4 py-3 text-left">Description</th><th className="px-4 py-3 text-right">Qty</th><th className="px-4 py-3 text-right">Rate</th><th className="px-4 py-3 text-right">Amount</th></tr></thead><tbody>{invoice.lineItems.map((line, idx) => (<tr key={idx} className="border-t border-line"><td className="px-4 py-3">{line.description}</td><td className="px-4 py-3 text-right">{line.quantity}</td><td className="px-4 py-3 text-right">{formatMoney(line.unitRate)}</td><td className="px-4 py-3 text-right">{formatMoney(line.quantity * line.unitRate)}</td></tr>))}</tbody></table></div>
        <div className="ml-auto max-w-xs space-y-1 text-sm">
          <p className="flex justify-between"><span>Subtotal</span><span>{formatMoney(invoice.subtotal)}</span></p>
          <p className="flex justify-between"><span>Tax</span><span>{formatMoney(invoice.tax)}</span></p>
          <p className="flex justify-between border-t border-line pt-2 font-display text-lg font-bold uppercase"><span>Total</span><span>{formatMoney(invoice.total)}</span></p>
        </div>
      </Card>
    </div>
  )
}
`)

console.log('batch4 done')
