import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { redirectToPanel, registerCandidate } from '@staffora/auth'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { email as emailRule, required } from '../utils/validation'

export default function RegisterPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  if (user?.portal === 'candidate') return <Navigate to="/dashboard" replace />

  const onSubmit = async (event) => {
    event.preventDefault()
    const next = {
      name: required(form.name, 'Enter your full name'),
      email: required(form.email) || emailRule(form.email),
      password: required(form.password, 'Enter a password') || (form.password.length < 8 ? 'Use at least 8 characters' : ''),
      confirm: form.confirm === form.password ? '' : 'Passwords do not match',
    }
    setErrors(next)
    setFormError('')
    if (Object.values(next).some(Boolean)) return
    setSubmitting(true)
    const result = await registerCandidate({ name: form.name, email: form.email, password: form.password })
    if (result.error) {
      setFormError(result.error)
      setSubmitting(false)
      return
    }
    redirectToPanel(result.session)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink text-cream">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgb(200_16_46_/_0.35),transparent_40%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-16">
        <p className="text-sm font-medium text-gold-soft">Staffora · Candidate Portal</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Create your account</h1>
        <p className="mt-3 text-sm text-cream/70">This signup is for candidates. After you register, your candidate panel opens.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-cream/15 bg-white p-6 text-ink shadow-lift" noValidate>
          <Field id="name" label="Full name" required error={errors.name}>
            <input id="name" autoComplete="name" className="input-field" value={form.name} onChange={(event) => set('name', event.target.value)} aria-invalid={errors.name ? 'true' : undefined} />
          </Field>
          <Field id="email" label="Email" required error={errors.email}>
            <input id="email" type="email" autoComplete="email" className="input-field" value={form.email} onChange={(event) => set('email', event.target.value)} aria-invalid={errors.email ? 'true' : undefined} />
          </Field>
          <Field id="password" label="Password" required error={errors.password}>
            <input id="password" type="password" autoComplete="new-password" className="input-field" value={form.password} onChange={(event) => set('password', event.target.value)} aria-invalid={errors.password ? 'true' : undefined} />
          </Field>
          <Field id="confirm" label="Confirm password" required error={errors.confirm}>
            <input id="confirm" type="password" autoComplete="new-password" className="input-field" value={form.confirm} onChange={(event) => set('confirm', event.target.value)} aria-invalid={errors.confirm ? 'true' : undefined} />
          </Field>
          {formError ? <p className="text-sm text-accent" role="alert">{formError}</p> : null}
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>{submitting ? 'Creating account…' : 'Create candidate account'}</Button>
          <p className="text-sm text-muted">Already registered? <Link className="text-accent" to="/login">Sign in</Link></p>
        </form>
      </div>
    </div>
  )
}
