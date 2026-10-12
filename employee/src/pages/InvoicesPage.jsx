import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDate, formatMoney } from '../utils/format'

export default function InvoicesPage() {
  const { state } = useData()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => {
    return state.invoices
      .filter((i) => i.companyId === state.companyId)
      .filter((i) => !status || i.status === status)
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
  }, [state, status])
  const slice = rows.slice((page - 1) * 5, page * 5)

  return (
    <div>
      <PageHeader title="Invoices" description="Invoices issued to your company." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Invoices' }]} />
      <div className="mb-4 max-w-xs">
        <select className="input-field" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          {['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <DataTable
        rows={slice}
        columns={[
          { key: 'number', label: 'Invoice', render: (i) => <Link className="font-medium hover:text-accent" to={`/invoices/${i.id}`}>{i.number}</Link> },
          { key: 'engagementLabel', label: 'Engagement' },
          { key: 'issueDate', label: 'Issued', render: (i) => formatDate(i.issueDate) },
          { key: 'dueDate', label: 'Due', render: (i) => formatDate(i.dueDate) },
          { key: 'total', label: 'Total', render: (i) => formatMoney(i.total) },
          { key: 'status', label: 'Status', render: (i) => <Badge tone={statusTone(i.status)}>{i.status}</Badge> },
        ]}
      />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
