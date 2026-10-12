import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import { useData } from '../context/DataContext'
import { useI18n } from '../i18n'
import { formatMoney } from '../utils/format'
import { Briefcase, Clock3, Receipt, Users } from 'lucide-react'

const COLORS = ['#c8102e', '#b45309', '#111827', '#0e7c47', '#a15c00']

export default function ReportsPage() {
  const { t } = useI18n()
  const { state } = useData()
  const cid = state.companyId

  const requestByStatus = useMemo(() => {
    const map = {}
    state.staffingRequests.filter((r) => r.companyId === cid).forEach((r) => {
      map[r.status] = (map[r.status] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name: t(name), value }))
  }, [state, cid, t])

  const hoursTrend = useMemo(() => {
    return state.timesheets
      .filter((ts) => ts.companyId === cid)
      .map((ts) => ({ week: ts.weekEnding.slice(5), hours: ts.totalHours, status: ts.status }))
  }, [state, cid])

  const invoiceSpend = useMemo(() => {
    return state.invoices
      .filter((i) => i.companyId === cid)
      .map((i) => ({ name: i.number.replace('INV-2026-', ''), total: i.total, status: i.status }))
  }, [state, cid])

  const placements = state.placements.filter((p) => p.companyId === cid).length
  const workers = state.workers.filter((w) => w.companyId === cid).length
  const pendingTs = state.timesheets.filter((ts) => ts.companyId === cid && ts.status === 'Submitted').length
  const openInv = state.invoices.filter((i) => i.companyId === cid && i.status !== 'Paid').reduce((s, i) => s + (i.total || 0), 0)

  return (
    <div>
      <PageHeader title={t('Reports')} description={t('Figures calculated from your company records.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Reports') }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('Placements')} value={placements} icon={Briefcase} />
        <StatCard label={t('Workers')} value={workers} icon={Users} />
        <StatCard label={t('Timesheets pending')} value={pendingTs} icon={Clock3} />
        <StatCard label={t('Open invoice value')} value={formatMoney(openInv)} icon={Receipt} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold">{t('Requests by status')}</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={requestByStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                  {requestByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold">{t('Timesheet hours')}</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" name={t('Hours')} fill="#c8102e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold">{t('Invoice totals')}</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={invoiceSpend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Bar dataKey="total" name={t('Total')} fill="#b45309" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
