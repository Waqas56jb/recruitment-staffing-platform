import { useParams } from 'react-router-dom'
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
            {invoice.status !== 'Paid' ? <Button onClick={() => { updateInvoice(id, { status: 'Paid' }); push({ title: 'Marked paid', message: 'The invoice status is saved.' }) }}>Mark paid</Button> : null}
          </>
        )} />
      <div className="mb-4"><Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge></div>
      <Card className="space-y-4 p-6" id="invoice-print">
        <div className="flex justify-between"><div><p className="font-display text-2xl font-semibold">Staffora</p><p className="text-sm text-muted">Demo invoice — not a tax document</p></div><div className="text-sm text-right"><p>Issue {formatDate(invoice.issueDate)}</p><p>Due {formatDate(invoice.dueDate)}</p></div></div>
        <p className="text-sm"><strong>Bill to:</strong> {company?.name}<br />{company?.billingAddress}</p>
        <div className="table-wrap"><table className="min-w-full text-sm"><thead className="bg-cream/70 text-xs text-muted"><tr><th className="px-4 py-3 text-left">Description</th><th className="px-4 py-3 text-right">Qty</th><th className="px-4 py-3 text-right">Rate</th><th className="px-4 py-3 text-right">Amount</th></tr></thead><tbody>{invoice.lineItems.map((line, idx) => (<tr key={idx} className="border-t border-line"><td className="px-4 py-3">{line.description}</td><td className="px-4 py-3 text-right">{line.quantity}</td><td className="px-4 py-3 text-right">{formatMoney(line.unitRate)}</td><td className="px-4 py-3 text-right">{formatMoney(line.quantity * line.unitRate)}</td></tr>))}</tbody></table></div>
        <div className="ml-auto max-w-xs space-y-1 text-sm">
          <p className="flex justify-between"><span>Subtotal</span><span>{formatMoney(invoice.subtotal)}</span></p>
          <p className="flex justify-between"><span>Tax</span><span>{formatMoney(invoice.tax)}</span></p>
          <p className="flex justify-between border-t border-line pt-2 font-display text-lg font-semibold"><span>Total</span><span>{formatMoney(invoice.total)}</span></p>
        </div>
      </Card>
    </div>
  )
}
