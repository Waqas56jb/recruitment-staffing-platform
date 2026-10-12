import { useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { formatDate, formatMoney } from '../utils/format'
import { useI18n } from '../i18n'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const { state, updateInvoice } = useData()
  const { push } = useToast()
  const { t } = useI18n()
  const invoice = state.invoices.find((i) => i.id === id)
  if (!invoice) return <EmptyState title={t('Invoice not found')} actionLabel={t('Back')} actionTo="/invoices" />
  const company = state.companies.find((c) => c.id === invoice.companyId)
  return (
    <div>
      <PageHeader title={invoice.number} description={invoice.engagementLabel} breadcrumbs={[{ label: t('Invoices'), to: '/invoices' }, { label: invoice.number }]}
        actions={(
          <>
            <Button variant="outline" onClick={() => window.print()}>{t('Print')}</Button>
            {invoice.status !== 'Paid' ? <Button onClick={() => { updateInvoice(id, { status: 'Paid' }); push({ title: t('Marked paid'), message: t('The invoice status is saved.') }) }}>{t('Mark paid')}</Button> : null}
          </>
        )} />
      <div className="mb-4"><Badge tone={statusTone(invoice.status)}>{t(invoice.status)}</Badge></div>
      <Card className="space-y-4 p-6" id="invoice-print">
        <div className="flex justify-between"><div><p className="font-display text-2xl font-semibold">Staffora</p><p className="text-sm text-muted">{t('Demo invoice — not a tax document')}</p></div><div className="text-sm text-right"><p>{t('Issue {date}', { date: formatDate(invoice.issueDate) })}</p><p>{t('Due {date}', { date: formatDate(invoice.dueDate) })}</p></div></div>
        <p className="text-sm"><strong>{t('Bill to:')}</strong> {company?.name}<br />{company?.billingAddress}</p>
        <div className="table-wrap"><table className="min-w-full text-sm"><thead className="bg-cream/70 text-xs text-muted"><tr><th className="px-4 py-3 text-left">{t('Description')}</th><th className="px-4 py-3 text-right">{t('Qty')}</th><th className="px-4 py-3 text-right">{t('Rate')}</th><th className="px-4 py-3 text-right">{t('Amount')}</th></tr></thead><tbody>{invoice.lineItems.map((line, idx) => (<tr key={idx} className="border-t border-line"><td className="px-4 py-3">{line.description}</td><td className="px-4 py-3 text-right">{line.quantity}</td><td className="px-4 py-3 text-right">{formatMoney(line.unitRate)}</td><td className="px-4 py-3 text-right">{formatMoney(line.quantity * line.unitRate)}</td></tr>))}</tbody></table></div>
        <div className="ml-auto max-w-xs space-y-1 text-sm">
          <p className="flex justify-between"><span>{t('Subtotal')}</span><span>{formatMoney(invoice.subtotal)}</span></p>
          <p className="flex justify-between"><span>{t('Tax')}</span><span>{formatMoney(invoice.tax)}</span></p>
          <p className="flex justify-between border-t border-line pt-2 font-display text-lg font-semibold"><span>{t('Total')}</span><span>{formatMoney(invoice.total)}</span></p>
        </div>
      </Card>
    </div>
  )
}
