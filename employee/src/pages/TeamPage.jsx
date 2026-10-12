import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'

export default function TeamPage() {
  const { state } = useData()
  const rows = state.employerUsers.filter((u) => u.companyId === state.companyId)

  return (
    <div>
      <PageHeader title="Team" description="People who can sign in for your company." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Team' }]} />
      <DataTable
        rows={rows}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'status', label: 'Status', render: (u) => <Badge tone={statusTone(u.status)}>{u.status}</Badge> },
        ]}
        emptyTitle="No team members"
      />
      <p className="mt-4 text-sm text-muted">Inviting or removing users requires a live identity service — not available in this frontend demo.</p>
    </div>
  )
}
