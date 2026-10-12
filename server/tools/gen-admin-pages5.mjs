import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve('admin/src/pages')
const w = (name, content) => { fs.writeFileSync(path.join(root, name), content); console.log('wrote', name) }

w('ReportsPage.jsx', `import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import { useData } from '../context/DataContext'
import { formatMoney } from '../utils/format'
import { Briefcase, Building2, Receipt, Users } from 'lucide-react'

const COLORS = ['#c8102e', '#c9a14a', '#0b0b0c', '#0e7c47', '#a15c00']

export default function ReportsPage() {
  const { state } = useData()
  const appsByStatus = useMemo(() => {
    const map = {}
    state.applications.forEach((a) => { map[a.status] = (map[a.status] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [state.applications])
  const invoiceByCompany = useMemo(() => state.companies.map((c) => ({
    name: c.name.split(' ')[0],
    total: state.invoices.filter((i) => i.companyId === c.id).reduce((s, i) => s + (i.total || 0), 0),
  })), [state])
  const hours = useMemo(() => state.timesheets.map((t) => ({ week: t.weekEnding.slice(5), hours: t.totalHours })), [state.timesheets])

  return (
    <div>
      <PageHeader title="Reports" description="Agency analytics from local demonstration records." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Reports' }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Companies" value={state.companies.length} icon={Building2} />
        <StatCard label="Candidates" value={state.candidates.length} icon={Users} />
        <StatCard label="Placements" value={state.placements.length} icon={Briefcase} />
        <StatCard label="Invoice volume" value={formatMoney(state.invoices.reduce((s, i) => s + (i.total || 0), 0))} icon={Receipt} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-lg font-bold uppercase">Applications by status</h2>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={appsByStatus} dataKey="value" nameKey="name" outerRadius={90} label>{appsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-lg font-bold uppercase">Timesheet hours</h2>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={hours}><CartesianGrid strokeDasharray="3 3" stroke="#dad7ce" /><XAxis dataKey="week" /><YAxis /><Tooltip /><Bar dataKey="hours" fill="#c8102e" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-bold uppercase">Invoice totals by company</h2>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={invoiceByCompany}><CartesianGrid strokeDasharray="3 3" stroke="#dad7ce" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(v) => formatMoney(v)} /><Bar dataKey="total" fill="#c9a14a" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Card>
      </div>
    </div>
  )
}
`)

w('NotificationsPage.jsx', `import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { formatDateTime } from '../utils/format'
import { useNavigate } from 'react-router-dom'
import { cn } from '../utils/cn'

export default function NotificationsPage() {
  const { state, markNotificationRead, markAllNotificationsRead } = useData()
  const navigate = useNavigate()
  const notes = state.notifications.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return (
    <div>
      <PageHeader title="Notifications" description="Cross-audience demo alerts visible to admin." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Notifications' }]}
        actions={notes.some((n) => !n.read) ? <Button variant="outline" onClick={() => markAllNotificationsRead(() => true)}>Mark all read</Button> : null} />
      {!notes.length ? <EmptyState title="No notifications" /> : (
        <div className="space-y-3">{notes.map((n) => (
          <button key={n.id} type="button" className={cn('w-full rounded-xl border px-4 py-3 text-left', n.read ? 'border-line bg-white' : 'border-accent/20 bg-cream')} onClick={() => { markNotificationRead(n.id); if (n.href) navigate(n.href) }}>
            <p className="text-xs uppercase tracking-wide text-muted">{n.audience}</p>
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-muted">{n.body}</p>
            <p className="mt-1 text-xs text-muted">{formatDateTime(n.createdAt)}</p>
          </button>
        ))}</div>
      )}
    </div>
  )
}
`)

w('UsersPage.jsx', `import Badge, { statusTone } from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'

export default function UsersPage() {
  const { state } = useData()
  return (
    <div>
      <PageHeader title="Users" description="Agency staff accounts in the demonstration directory." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Users' }]} />
      <DataTable rows={state.agencyUsers} columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status', render: (u) => <Badge tone={statusTone(u.status)}>{u.status}</Badge> },
      ]} />
      <p className="mt-4 text-sm text-muted">Provisioning real users requires an identity provider — not available in this frontend.</p>
    </div>
  )
}
`)

w('RolesPage.jsx', `import Card from '../components/ui/Card'
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
            <h2 className="font-display text-lg font-bold uppercase">{row.role}</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted">{row.modules.map((m) => <li key={m}>{m}</li>)}</ul>
          </Card>
        ))}
      </div>
    </div>
  )
}
`)

w('AuditLogPage.jsx', `import { useMemo, useState } from 'react'
import DataTable from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { useData } from '../context/DataContext'
import { formatDateTime } from '../utils/format'

export default function AuditLogPage() {
  const { state } = useData()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const rows = useMemo(() => state.auditEvents
    .filter((e) => !q || \`\${e.actor} \${e.action} \${e.summary}\`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [state.auditEvents, q])
  const slice = rows.slice((page - 1) * 8, page * 8)
  return (
    <div>
      <PageHeader title="Audit log" description="Local demonstration events. Not a compliance-grade trail." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Audit log' }]} />
      <input className="input-field mb-4 max-w-md" placeholder="Search events" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      <DataTable rows={slice} columns={[
        { key: 'timestamp', label: 'When', render: (e) => formatDateTime(e.timestamp) },
        { key: 'actor', label: 'Actor' },
        { key: 'action', label: 'Action' },
        { key: 'entityType', label: 'Entity' },
        { key: 'summary', label: 'Summary' },
      ]} />
      <Pagination page={page} pageSize={8} total={rows.length} onChange={setPage} />
    </div>
  )
}
`)

w('SettingsPage.jsx', `import { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../context/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const { push } = useToast()
  const [timezone, setTimezone] = useState('Europe/London')
  const [currency, setCurrency] = useState('GBP')
  return (
    <div>
      <PageHeader title="Settings" description="Console preferences for this demo session." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Settings' }]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 text-sm">
          <h2 className="font-display text-lg font-bold uppercase">Signed-in user</h2>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </Card>
        <Card className="space-y-4">
          <h2 className="font-display text-lg font-bold uppercase">Agency defaults</h2>
          <Field id="tz" label="Timezone"><select id="tz" className="input-field" value={timezone} onChange={(e) => setTimezone(e.target.value)}><option>Europe/London</option><option>UTC</option></select></Field>
          <Field id="cur" label="Currency"><select id="cur" className="input-field" value={currency} onChange={(e) => setCurrency(e.target.value)}><option>GBP</option><option>EUR</option><option>USD</option></select></Field>
          <Button onClick={() => push({ title: 'Settings saved locally', message: 'No organisation settings were synced.' })}>Save</Button>
        </Card>
      </div>
    </div>
  )
}
`)

console.log('batch5 done')
