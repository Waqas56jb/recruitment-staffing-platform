import { useMemo, useState } from 'react'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function DocumentsPage() {
  const { state } = useData()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.documents.filter((d) => !q || `${d.title} ${d.category}`.toLowerCase().includes(q.toLowerCase())), [state.documents, q])
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
        { key: 'fileName', label: 'File', render: (d) => d.fileName || 'No file stored' },
      ]} />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
