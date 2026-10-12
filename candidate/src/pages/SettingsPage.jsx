import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n'
import { api } from '@staffora/api'

export default function SettingsPage() {
  const { t } = useI18n()
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
      push({ title: t('Preferences saved'), message: t('Your alert settings are stored.') })
    } catch (error) {
      push({ title: t('Could not save'), message: t(error.message), tone: 'error' })
    }
  }

  return (
    <div>
      <PageHeader title={t('Settings')} description={t('Account preferences stored in Staffora.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Settings') }]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 text-sm">
          <h2 className="font-display text-lg font-semibold">{t('Account')}</h2>
          <p><strong>{t('Name:')}</strong> {user?.name}</p>
          <p><strong>{t('Email:')}</strong> {user?.email}</p>
          <p><strong>{t('Profile:')}</strong> {user?.candidateId || user?.id}</p>
          <p className="text-xs text-muted">{t('A super admin can reset a password from the admin users page.')}</p>
        </Card>
        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">{t('Alerts')}</h2>
          <Field id="jobs" label={t('Job match alerts')}>
            <label className="flex items-center gap-2 text-sm"><input id="jobs" type="checkbox" checked={jobAlerts} onChange={(e) => setJobAlerts(e.target.checked)} /> {t('Enabled')}</label>
          </Field>
          <Field id="int" label={t('Interview reminders')}>
            <label className="flex items-center gap-2 text-sm"><input id="int" type="checkbox" checked={interviewReminders} onChange={(e) => setInterviewReminders(e.target.checked)} /> {t('Enabled')}</label>
          </Field>
          <Button onClick={save}>{t('Save preferences')}</Button>
        </Card>
      </div>
    </div>
  )
}
