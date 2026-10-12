import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { authenticate, redirectToPanel } from '@staffora/auth'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { email as emailRule, required } from '../utils/validation'

export default function LoginPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user?.portal === 'admin') return <Navigate to="/dashboard" replace />

  const onSubmit = async (event) => {
    event.preventDefault()
    const next = {
      email: required(email) || emailRule(email),
      password: required(password, 'Enter your password'),
    }
    setErrors(next)
    setFormError('')
    if (Object.values(next).some(Boolean)) return
    setSubmitting(true)
    const result = await authenticate(email, password)
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
        <p className="text-sm font-medium text-gold-soft">Staffora · Admin Console</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Sign in</h1>
        <p className="mt-3 text-sm text-cream/70">Use the admin account issued by Staffora.</p>
        <form onSubmit={onSubmit} className="mt-8 rounded-2xl border border-cream/15 bg-white p-6 text-ink shadow-lift" noValidate>
          <Field id="email" label="Email" required error={errors.email}>
            <input id="email" type="email" autoComplete="username" className="input-field" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={errors.email ? 'true' : undefined} />
          </Field>
          <div className="mt-4">
            <Field id="password" label="Password" required error={errors.password}>
              <input id="password" type="password" autoComplete="current-password" className="input-field" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={errors.password ? 'true' : undefined} />
            </Field>
          </div>
          {formError ? <p className="mt-4 text-sm text-accent" role="alert">{formError}</p> : null}
          <Button type="submit" className="mt-6 w-full" size="lg" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</Button>
        </form>
      </div>
    </div>
  )
}
