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
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [timesheetReminders, setTimesheetReminders] = useState(true)
  const [invoiceAlerts, setInvoiceAlerts] = useState(true)

  useEffect(() => {
    api('/api/auth/me').then((data) => {
      const settings = data.user?.settings || {}
      if (typeof settings.emailAlerts === 'boolean') setEmailAlerts(settings.emailAlerts)
      if (typeof settings.timesheetReminders === 'boolean') setTimesheetReminders(settings.timesheetReminders)
      if (typeof settings.invoiceAlerts === 'boolean') setInvoiceAlerts(settings.invoiceAlerts)
    }).catch(() => {})
  }, [])

  const save = async () => {
    try {
      await api('/api/me/settings', { method: 'PATCH', body: JSON.stringify({ emailAlerts, timesheetReminders, invoiceAlerts }) })
      push({ title: t('Preferences saved'), message: t('Notification settings are stored on your account.') })
    } catch (error) {
      push({ title: t('Could not save'), message: t(error.message), tone: 'error' })
    }
  }

  return (
    <div>
      <PageHeader title={t('Settings')} description={t('Account preferences stored in Staffora.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Settings') }]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">{t('Account')}</h2>
          <p className="text-sm"><strong>{t('Name:')}</strong> {user?.name}</p>
          <p className="text-sm"><strong>{t('Email:')}</strong> {user?.email}</p>
          <p className="text-sm"><strong>{t('Role:')}</strong> {user?.role ? t(user.role) : ''}</p>
          <p className="text-xs text-muted">{t('A super admin can reset a password from the admin users page.')}</p>
        </Card>
        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">{t('Notifications')}</h2>
          <Field id="emailAlerts" label={t('Email digest (simulated)')}>
            <label className="flex items-center gap-2 text-sm"><input id="emailAlerts" type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} /> {t('Enabled')}</label>
          </Field>
          <Field id="ts" label={t('Timesheet reminders')}>
            <label className="flex items-center gap-2 text-sm"><input id="ts" type="checkbox" checked={timesheetReminders} onChange={(e) => setTimesheetReminders(e.target.checked)} /> {t('Enabled')}</label>
          </Field>
          <Field id="inv" label={t('Invoice alerts')}>
            <label className="flex items-center gap-2 text-sm"><input id="inv" type="checkbox" checked={invoiceAlerts} onChange={(e) => setInvoiceAlerts(e.target.checked)} /> {t('Enabled')}</label>
          </Field>
          <Button onClick={save}>{t('Save preferences')}</Button>
        </Card>
      </div>
    </div>
  )
}
