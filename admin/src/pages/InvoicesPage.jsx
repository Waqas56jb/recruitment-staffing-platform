import { useMemo, useState } from 'react'
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
        { key: 'number', label: 'Invoice', render: (i) => <Link className="font-medium hover:text-accent" to={`/invoices/${i.id}`}>{i.number}</Link> },
        { key: 'company', label: 'Company', render: (i) => state.companies.find((c) => c.id === i.companyId)?.name },
        { key: 'issueDate', label: 'Issued', render: (i) => formatDate(i.issueDate) },
        { key: 'total', label: 'Total', render: (i) => formatMoney(i.total) },
        { key: 'status', label: 'Status', render: (i) => <Badge tone={statusTone(i.status)}>{i.status}</Badge> },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
