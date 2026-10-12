import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'

export default function RolesPage() {
  const { state } = useData()
  return (
    <div>
      <PageHeader title="Roles & permissions" description="Static capability matrix for agency roles (documentation only)." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Roles' }]} />
      <div className="grid gap-4 md:grid-cols-2">
        {state.rolesMatrix.map((row) => (
          <Card key={row.role} className="space-y-2">
            <h2 className="font-display text-lg font-semibold">{row.role}</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted">{row.modules.map((m) => <li key={m}>{m}</li>)}</ul>
          </Card>
        ))}
      </div>
    </div>
  )
}
