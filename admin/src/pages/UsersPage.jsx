import { useEffect, useState } from 'react'
import {
  accountsVisibleTo,
  canChangePassword,
  canDeleteAccount,
  canViewPasswords,
  changePassword,
  createStaffAccount,
  creatableRoles,
  deleteAccount,
  readAccounts,
} from '@staffora/auth'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { email as emailRule, required } from '../utils/validation'

export default function UsersPage() {
  const { user } = useAuth()
  const { push } = useToast()
  const [accounts, setAccounts] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', role: creatableRoles(user)[0] || '' })
  const [errors, setErrors] = useState({})
  const [pendingDelete, setPendingDelete] = useState(null)
  const [drafts, setDrafts] = useState({})
  const refresh = () => readAccounts().then(setAccounts).catch((error) => push({ title: 'Could not load accounts', message: error.message, tone: 'error' }))
  useEffect(() => { refresh() }, [])
  const roles = creatableRoles(user)
  const visible = accountsVisibleTo(user, accounts)
  const showPasswords = canViewPasswords(user)
  const showActions = showPasswords || visible.some((account) => canDeleteAccount(user, account))
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const onCreate = async (event) => {
    event.preventDefault()
    const next = {
      name: required(form.name),
      email: required(form.email) || emailRule(form.email),
      password: required(form.password, 'Enter a password') || (form.password.length < 8 ? 'Use at least 8 characters' : ''),
      role: roles.includes(form.role) ? '' : 'Choose a role you are allowed to create',
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    const result = await createStaffAccount(user, form)
    if (result.error) {
      push({ title: 'Could not create account', message: result.error, tone: 'error' })
      return
    }
    setForm({ name: '', email: '', password: '', role: roles[0] || '' })
    refresh()
    push({ title: 'Account created', message: `${result.account.name} can sign in on the public website.` })
  }

  const onDelete = async () => {
    const result = await deleteAccount(user, pendingDelete.id)
    setPendingDelete(null)
    if (result.error) {
      push({ title: 'Could not delete', message: result.error, tone: 'error' })
      return
    }
    refresh()
    push({ title: 'Account deleted', message: 'That person can no longer sign in.' })
  }

  const onPassword = async (account) => {
    const result = await changePassword(user, account.id, drafts[account.id] || '')
    if (result.error) {
      push({ title: 'Could not update password', message: result.error, tone: 'error' })
      return
    }
    setDrafts((current) => ({ ...current, [account.id]: '' }))
    refresh()
    push({ title: 'Password updated', message: `${account.name} must use the new password to sign in.` })
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Account access follows your role. Only a super admin can see or change passwords."
        breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Users' }]}
      />

      {roles.length ? (
        <Card className="mb-6">
          <h2 className="font-display text-lg font-semibold">Create account</h2>
          <p className="mt-1 text-sm text-muted">
            {user.role === 'Admin'
              ? 'You can create sub admins. You cannot create admins, and you cannot see or change passwords.'
              : 'You can create admins and sub admins.'}
          </p>
          <form onSubmit={onCreate} className="mt-4 grid gap-4 md:grid-cols-2">
            <Field id="name" label="Full name" required error={errors.name}>
              <input id="name" className="input-field" value={form.name} onChange={(event) => set('name', event.target.value)} />
            </Field>
            <Field id="email" label="Email" required error={errors.email}>
              <input id="email" type="email" className="input-field" value={form.email} onChange={(event) => set('email', event.target.value)} />
            </Field>
            <Field id="password" label="Password" required error={errors.password} hint="At least 8 characters. Only a super admin can see it later.">
              <input id="password" type="text" className="input-field" value={form.password} onChange={(event) => set('password', event.target.value)} />
            </Field>
            <Field id="role" label="Role" required error={errors.role}>
              <select id="role" className="input-field" value={form.role} onChange={(event) => set('role', event.target.value)}>
                {roles.map((role) => <option key={role}>{role}</option>)}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Button type="submit">Create account</Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="mb-6 text-sm text-muted">
          Your role cannot create admins, view anyone’s credentials, or change them.
        </Card>
      )}

      {visible.length ? (
        <div className="table-wrap">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-cream text-xs font-medium text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                {showPasswords ? <th className="px-4 py-3">Password</th> : null}
                <th className="px-4 py-3">Status</th>
                {showActions ? <th className="px-4 py-3">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {visible.map((account) => (
                <tr key={account.id} className="border-t border-line">
                  <td className="px-4 py-3">{account.name}</td>
                  <td className="px-4 py-3">{account.email}</td>
                  <td className="px-4 py-3">{account.role}</td>
                  {showPasswords ? <td className="px-4 py-3 font-medium">{account.password}</td> : null}
                  <td className="px-4 py-3"><Badge tone={statusTone(account.status)}>{account.status}</Badge></td>
                  {showActions ? <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {canChangePassword(user) ? (
                        <form onSubmit={(event) => { event.preventDefault(); onPassword(account) }} className="flex gap-2">
                          <input
                            aria-label={`New password for ${account.name}`}
                            className="input-field min-h-9 w-36 py-1"
                            value={drafts[account.id] || ''}
                            onChange={(event) => setDrafts((current) => ({ ...current, [account.id]: event.target.value }))}
                            placeholder="New password"
                          />
                          <Button type="submit" size="sm" variant="outline">Save</Button>
                        </form>
                      ) : null}
                      {canDeleteAccount(user, account) ? (
                        <Button type="button" size="sm" variant="danger" onClick={() => setPendingDelete(account)}>Delete</Button>
                      ) : null}
                    </div>
                  </td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : roles.length ? (
        <Card className="text-sm text-muted">No sub admins yet.</Card>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete account"
        message={pendingDelete ? `${pendingDelete.name} will no longer be able to sign in.` : ''}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={onDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  )
}
