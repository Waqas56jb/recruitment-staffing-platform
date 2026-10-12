import { useMemo, useState } from 'react'
import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { formatDate } from '../utils/format'

export default function DocumentsPage() {
  const { t } = useI18n()
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
      <PageHeader title={t('Documents')} description={t('Documents stored for your company. File names are kept; file bytes are not.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Documents') }]} />
      <input className="input-field mb-4 max-w-md" placeholder={t('Search documents')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable
        rows={slice}
        columns={[
          { key: 'title', label: t('Document') },
          { key: 'category', label: t('Category'), render: (d) => t(d.category) },
          { key: 'issuedAt', label: t('Issued'), render: (d) => formatDate(d.issuedAt) },
          { key: 'expiresAt', label: t('Expires'), render: (d) => formatDate(d.expiresAt) },
          { key: 'status', label: t('Status'), render: (d) => <Badge tone={statusTone(d.status)}>{t(d.status)}</Badge> },
          { key: 'fileName', label: t('File'), render: (d) => d.fileName || t('No file stored') },
        ]}
      />
      <Pagination page={page} pageSize={5} total={rows.length} onChange={setPage} />
    </div>
  )
}
