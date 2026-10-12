import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../context/AuthContext'
import { api } from '@staffora/api'

export default function SettingsPage() {
  const { user } = useAuth()
  const { push } = useToast()
  const [jobAlerts, setJobAlerts] = useState(true)
  const [interviewReminders, setInterviewReminders] = useState(true)

  useEffect(() => {
    api('/api/auth/me').then((data) => {
      const settings = data.user?.settings || {}
      if (typeof settings.jobAlerts === 'boolean') setJobAlerts(settings.jobAlerts)
      if (typeof settings.interviewReminders === 'boolean') setInterviewReminders(settings.interviewReminders)
    }).catch(() => {})
  }, [])

  const save = async () => {
    try {
      await api('/api/me/settings', { method: 'PATCH', body: JSON.stringify({ jobAlerts, interviewReminders }) })
      push({ title: 'Preferences saved', message: 'Your alert settings are stored.' })
    } catch (error) {
      push({ title: 'Could not save', message: error.message, tone: 'error' })
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Account preferences stored in Staffora." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Settings' }]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 text-sm">
          <h2 className="font-display text-lg font-semibold">Account</h2>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Profile:</strong> {user?.candidateId || user?.id}</p>
          <p className="text-xs text-muted">A super admin can reset a password from the admin users page.</p>
        </Card>
        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Alerts</h2>
          <Field id="jobs" label="Job match alerts">
            <label className="flex items-center gap-2 text-sm"><input id="jobs" type="checkbox" checked={jobAlerts} onChange={(e) => setJobAlerts(e.target.checked)} /> Enabled</label>
          </Field>
          <Field id="int" label="Interview reminders">
            <label className="flex items-center gap-2 text-sm"><input id="int" type="checkbox" checked={interviewReminders} onChange={(e) => setInterviewReminders(e.target.checked)} /> Enabled</label>
          </Field>
          <Button onClick={save}>Save preferences</Button>
        </Card>
      </div>
    </div>
  )
}
