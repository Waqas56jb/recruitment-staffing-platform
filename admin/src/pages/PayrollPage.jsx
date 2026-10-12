import { Link } from 'react-router-dom'
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
      <PageHeader title="Payroll" description="Payroll periods and entries stored in Staffora." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Payroll' }]} />
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {state.payrollPeriods.map((p) => (
          <Card key={p.id} className="space-y-2">
            <div className="flex justify-between"><Link className="font-display text-lg font-semibold hover:text-accent" to={`/payroll/${p.id}`}>{p.label}</Link><Badge tone={statusTone(p.status)}>{p.status}</Badge></div>
            <p className="text-sm text-muted">{formatDate(p.startDate)} – {formatDate(p.endDate)}</p>
          </Card>
        ))}
      </div>
      <h2 className="mb-3 font-display text-lg font-semibold">Entries</h2>
      <DataTable rows={state.payrollEntries} columns={[
        { key: 'worker', label: 'Worker', render: (e) => state.workers.find((w) => w.id === e.workerId)?.displayName },
        { key: 'periodId', label: 'Period', render: (e) => <Link className="text-accent" to={`/payroll/${e.periodId}`}>{e.periodId}</Link> },
        { key: 'gross', label: 'Gross', render: (e) => formatMoney(e.gross) },
        { key: 'net', label: 'Net', render: (e) => formatMoney(e.net) },
        { key: 'status', label: 'Status', render: (e) => <Badge tone={statusTone(e.status)}>{e.status}</Badge> },
      ]} />
    </div>
  )
}
