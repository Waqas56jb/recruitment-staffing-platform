import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'

export default function TeamPage() {
  const { state } = useData()
  const { t } = useI18n()
  const rows = state.employerUsers.filter((u) => u.companyId === state.companyId)

  return (
    <div>
      <PageHeader title={t('Team')} description={t('People who can sign in for your company.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Team') }]} />
      <DataTable
        rows={rows}
        columns={[
          { key: 'name', label: t('Name') },
          { key: 'email', label: t('Email') },
          { key: 'role', label: t('Role'), render: (u) => t(u.role) },
          { key: 'status', label: t('Status'), render: (u) => <Badge tone={statusTone(u.status)}>{t(u.status)}</Badge> },
        ]}
        emptyTitle={t('No team members')}
      />
      <p className="mt-4 text-sm text-muted">{t('Inviting or removing users requires a live identity service — not available in this frontend demo.')}</p>
    </div>
  )
}
