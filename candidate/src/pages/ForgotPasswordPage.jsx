import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@staffora/api'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import { useToast } from '../components/ui/Toast'
import { email as emailRule, required } from '../utils/validation'

export default function ForgotPasswordPage() {
  const { push } = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    const err = required(email) || emailRule(email)
    setError(err || '')
    if (err) return
    setSubmitting(true)
    try {
      await api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
      setSent(true)
      push({ title: 'Request saved', message: 'A super admin can set a new password from Users.' })
    } catch (requestError) {
      push({ title: 'Could not send request', message: requestError.message, tone: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink text-cream">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgb(200_16_46_/_0.35),transparent_40%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-16">
        <p className="eyebrow text-gold-soft">Staffora · Candidate Portal</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Reset password</h1>
        <p className="mt-3 text-sm text-cream/70">Ask the agency to set a new password. No email is sent from this screen.</p>
        <form onSubmit={onSubmit} className="mt-8 rounded-2xl border border-cream/15 bg-white p-6 text-ink shadow-lift">
          <Field id="email" label="Email" required error={error}>
            <input id="email" type="email" className="input-field" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Button type="submit" className="mt-6 w-full" size="lg" disabled={submitting}>{submitting ? 'Sending…' : 'Request password reset'}</Button>
          {sent ? <p className="mt-4 text-sm text-success">Request saved. A super admin sets the new password.</p> : null}
          <p className="mt-4 text-sm text-muted"><Link className="text-accent" to="/login">Back to sign in</Link></p>
        </form>
      </div>
    </div>
  )
}
