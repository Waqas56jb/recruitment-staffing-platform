import { useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { formatDate, formatMoney } from '../utils/format'
import { useI18n } from '../i18n'

export default function PayrollDetailPage() {
  const { id } = useParams()
  const { state, updatePayrollEntry } = useData()
  const { push } = useToast()
  const { t } = useI18n()
  const period = state.payrollPeriods.find((p) => p.id === id)
  if (!period) return <EmptyState title={t('Period not found')} actionLabel={t('Back')} actionTo="/payroll" />
  const entries = state.payrollEntries.filter((e) => e.periodId === id)
  return (
    <div>
      <PageHeader title={period.label} description={`${formatDate(period.startDate)} – ${formatDate(period.endDate)}`} breadcrumbs={[{ label: t('Payroll'), to: '/payroll' }, { label: period.label }]} />
      <div className="mb-4"><Badge tone={statusTone(period.status)}>{t(period.status)}</Badge></div>
      <Card className="mb-4 text-sm text-muted">{t('These figures are demo estimates. No salaries are calculated for tax or paid.')}</Card>
      <DataTable rows={entries} columns={[
        { key: 'worker', label: t('Worker'), render: (e) => state.workers.find((w) => w.id === e.workerId)?.displayName },
        { key: 'regularHours', label: t('Regular') },
        { key: 'overtimeHours', label: t('OT') },
        { key: 'gross', label: t('Gross'), render: (e) => formatMoney(e.gross) },
        { key: 'net', label: t('Net'), render: (e) => formatMoney(e.net) },
        { key: 'status', label: t('Status'), render: (e) => <Badge tone={statusTone(e.status)}>{t(e.status)}</Badge> },
        { key: 'a', label: '', render: (e) => e.status === 'Pending Review' ? <Button size="sm" onClick={() => { updatePayrollEntry(e.id, { status: 'Approved' }); push({ title: t('Entry approved'), message: t('The payroll entry is saved.') }) }}>{t('Approve')}</Button> : null },
      ]} />
    </div>
  )
}
