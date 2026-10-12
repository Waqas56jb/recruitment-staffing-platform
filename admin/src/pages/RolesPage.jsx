import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'

export default function RolesPage() {
  const { state } = useData()
  const { t } = useI18n()
  return (
    <div>
      <PageHeader title={t('Roles & permissions')} description={t('Static capability matrix for agency roles (documentation only).')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Roles') }]} />
      <div className="grid gap-4 md:grid-cols-2">
        {state.rolesMatrix.map((row) => (
          <Card key={row.role} className="space-y-2">
            <h2 className="font-display text-lg font-semibold">{t(row.role)}</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted">{row.modules.map((m) => <li key={m}>{t(m)}</li>)}</ul>
          </Card>
        ))}
      </div>
    </div>
  )
}
