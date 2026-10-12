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
  const rows = useMemo(() => {
    return state.documents
      .filter((d) => d.companyId === state.companyId)
      .filter((d) => !q || `${d.title} ${d.category}`.toLowerCase().includes(q.toLowerCase()))
  }, [state, q])
  const slice = rows.slice((page - 1) * 5, page * 5)

  return (
    <div>
      <PageHeader title="Documents" description="Documents stored for your company. File names are kept; file bytes are not." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Documents' }]} />
      <input className="input-field mb-4 max-w-md" placeholder="Search documents" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable
        rows={slice}
        columns={[
          { key: 'title', label: 'Document' },
          { key: 'category', label: 'Category' },
          { key: 'issuedAt', label: 'Issued', render: (d) => formatDate(d.issuedAt) },
          { key: 'expiresAt', label: 'Expires', render: (d) => formatDate(d.expiresAt) },
          { key: 'status', label: 'Status', render: (d) => <Badge tone={statusTone(d.status)}>{d.status}</Badge> },
          { key: 'fileName', label: 'File', render: (d) => d.fileName || 'No file stored' },
        ]}
      />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
