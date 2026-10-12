import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDate, formatMoney } from '../utils/format'
import { useI18n } from '../i18n'

export default function PayrollPage() {
  const { state } = useData()
  const { t } = useI18n()
  return (
    <div>
      <PageHeader title={t('Payroll')} description={t('Payroll periods and entries stored in Staffora.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Payroll') }]} />
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {state.payrollPeriods.map((p) => (
          <Card key={p.id} className="space-y-2">
            <div className="flex justify-between"><Link className="font-display text-lg font-semibold hover:text-accent" to={`/payroll/${p.id}`}>{p.label}</Link><Badge tone={statusTone(p.status)}>{t(p.status)}</Badge></div>
            <p className="text-sm text-muted">{formatDate(p.startDate)} – {formatDate(p.endDate)}</p>
          </Card>
        ))}
      </div>
      <h2 className="mb-3 font-display text-lg font-semibold">{t('Entries')}</h2>
      <DataTable rows={state.payrollEntries} columns={[
        { key: 'worker', label: t('Worker'), render: (e) => state.workers.find((w) => w.id === e.workerId)?.displayName },
        { key: 'periodId', label: t('Period'), render: (e) => <Link className="text-accent" to={`/payroll/${e.periodId}`}>{e.periodId}</Link> },
        { key: 'gross', label: t('Gross'), render: (e) => formatMoney(e.gross) },
        { key: 'net', label: t('Net'), render: (e) => formatMoney(e.net) },
        { key: 'status', label: t('Status'), render: (e) => <Badge tone={statusTone(e.status)}>{t(e.status)}</Badge> },
      ]} />
    </div>
  )
}
