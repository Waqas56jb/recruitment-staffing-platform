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
  const { user } = useAuth()
  const { push } = useToast()
  const { t } = useI18n()
  const [timezone, setTimezone] = useState('Europe/London')
  const [currency, setCurrency] = useState('GBP')

  useEffect(() => {
    api('/api/auth/me').then((data) => {
      if (data.user?.settings?.timezone) setTimezone(data.user.settings.timezone)
      if (data.user?.settings?.currency) setCurrency(data.user.settings.currency)
    }).catch(() => {})
  }, [])

  const save = async () => {
    try {
      await api('/api/me/settings', { method: 'PATCH', body: JSON.stringify({ timezone, currency }) })
      push({ title: t('Settings saved'), message: t('Agency defaults are stored on your account.') })
    } catch (error) {
      push({ title: t('Could not save'), message: t(error.message), tone: 'error' })
    }
  }
  return (
    <div>
      <PageHeader title={t('Settings')} description={t('Preferences stored on your Staffora account.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Settings') }]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 text-sm">
          <h2 className="font-display text-lg font-semibold">{t('Signed-in user')}</h2>
          <p><strong>{t('Name:')}</strong> {user?.name}</p>
          <p><strong>{t('Email:')}</strong> {user?.email}</p>
          <p><strong>{t('Role:')}</strong> {user?.role ? t(user.role) : ''}</p>
        </Card>
        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">{t('Agency defaults')}</h2>
          <Field id="tz" label={t('Timezone')}><select id="tz" className="input-field" value={timezone} onChange={(e) => setTimezone(e.target.value)}><option>Europe/London</option><option>UTC</option></select></Field>
          <Field id="cur" label={t('Currency')}><select id="cur" className="input-field" value={currency} onChange={(e) => setCurrency(e.target.value)}><option>GBP</option><option>EUR</option><option>USD</option></select></Field>
          <Button onClick={save}>{t('Save')}</Button>
        </Card>
      </div>
    </div>
  )
}
