import { useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDate, formatMoney } from '../utils/format'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const { state } = useData()
  const invoice = state.invoices.find((i) => i.id === id && i.companyId === state.companyId)
  if (!invoice) return <EmptyState title="Invoice not found" actionLabel="Back" actionTo="/invoices" />
  const company = state.companies.find((c) => c.id === invoice.companyId)

  return (
    <div>
      <PageHeader
        title={invoice.number}
        description={invoice.engagementLabel}
        breadcrumbs={[{ label: 'Invoices', to: '/invoices' }, { label: invoice.number }]}
        actions={<Button variant="outline" onClick={() => window.print()}>Print / PDF</Button>}
      />
      <div className="mb-4"><Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge></div>
      <Card className="print:border-0 print:shadow-none space-y-6 p-6" id="invoice-print">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="font-display text-2xl font-semibold">Staffora</p>
            <p className="text-sm text-muted">Demonstration invoice — not a tax document</p>
          </div>
          <div className="text-sm text-right">
            <p><strong>Issue:</strong> {formatDate(invoice.issueDate)}</p>
            <p><strong>Due:</strong> {formatDate(invoice.dueDate)}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div>
            <p className="font-display text-xs font-semibold text-muted">Bill to</p>
            <p className="mt-1 font-medium">{company?.name}</p>
            <p className="text-muted">{company?.billingAddress}</p>
          </div>
          <div>
            <p className="font-display text-xs font-semibold text-muted">Engagement</p>
            <p className="mt-1">{invoice.engagementLabel}</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="min-w-full text-sm">
            <thead className="bg-cream/70 text-xs text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((line, idx) => (
                <tr key={idx} className="border-t border-line">
                  <td className="px-4 py-3">{line.description}</td>
                  <td className="px-4 py-3 text-right">{line.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatMoney(line.unitRate)}</td>
                  <td className="px-4 py-3 text-right">{formatMoney(line.quantity * line.unitRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ml-auto max-w-xs space-y-1 text-sm">
          <p className="flex justify-between"><span>Subtotal</span><span>{formatMoney(invoice.subtotal)}</span></p>
          <p className="flex justify-between"><span>Tax ({Math.round((invoice.taxRate || 0) * 100)}%)</span><span>{formatMoney(invoice.tax)}</span></p>
          <p className="flex justify-between border-t border-line pt-2 font-display text-lg font-semibold"><span>Total</span><span>{formatMoney(invoice.total)}</span></p>
        </div>
      </Card>
    </div>
  )
}
