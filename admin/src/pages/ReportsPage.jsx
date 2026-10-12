import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { formatMoney } from '../utils/format'
import { Briefcase, Building2, Receipt, Users } from 'lucide-react'

const COLORS = ['#c8102e', '#b45309', '#111827', '#0e7c47', '#a15c00']

export default function ReportsPage() {
  const { state } = useData()
  const { t } = useI18n()
  const appsByStatus = useMemo(() => {
    const map = {}
    state.applications.forEach((a) => { map[a.status] = (map[a.status] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name: t(name), value }))
  }, [state.applications, t])
  const invoiceByCompany = useMemo(() => state.companies.map((c) => ({
    name: c.name.split(' ')[0],
    total: state.invoices.filter((i) => i.companyId === c.id).reduce((s, i) => s + (i.total || 0), 0),
  })), [state])
  const hours = useMemo(() => state.timesheets.map((t) => ({ week: t.weekEnding.slice(5), hours: t.totalHours })), [state.timesheets])

  return (
    <div>
      <PageHeader title={t('Reports')} description={t('Agency figures from live records.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Reports') }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('Companies')} value={state.companies.length} icon={Building2} />
        <StatCard label={t('Candidates')} value={state.candidates.length} icon={Users} />
        <StatCard label={t('Placements')} value={state.placements.length} icon={Briefcase} />
        <StatCard label={t('Invoice volume')} value={formatMoney(state.invoices.reduce((s, i) => s + (i.total || 0), 0))} icon={Receipt} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold">{t('Applications by status')}</h2>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={appsByStatus} dataKey="value" nameKey="name" outerRadius={90} label>{appsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold">{t('Timesheet hours')}</h2>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={hours}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="week" /><YAxis /><Tooltip /><Bar dataKey="hours" name={t('Hours')} fill="#c8102e" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold">{t('Invoice totals by company')}</h2>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={invoiceByCompany}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(v) => formatMoney(v)} /><Bar dataKey="total" name={t('Total')} fill="#b45309" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Card>
      </div>
    </div>
  )
}
