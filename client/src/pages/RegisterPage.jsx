import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registerCandidate, redirectToPanel } from '@staffora/auth'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import { email as emailRule, required } from '../utils/validation'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', consent: false })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const onSubmit = async (event) => {
    event.preventDefault()
    const next = {
      name: required(form.name, 'Enter your full name'),
      email: required(form.email) || emailRule(form.email),
      password: required(form.password, 'Enter a password') || (form.password.length < 8 ? 'Use at least 8 characters' : ''),
      confirm: form.confirm === form.password ? '' : 'Passwords do not match',
      consent: form.consent ? '' : 'Consent is required',
    }
    setErrors(next)
    setFormError('')
    if (Object.values(next).some(Boolean)) return
    const result = await registerCandidate({ name: form.name, email: form.email, password: form.password })
    if (result.error) {
      setFormError(result.error)
      return
    }
    redirectToPanel(result.session)
  }

  return (
    <section className="bg-cream pt-28 pb-16 sm:pt-32">
      <Container className="max-w-lg">
        <form onSubmit={onSubmit} className="form-panel" noValidate>
          <p className="eyebrow">Candidates</p>
          <h1 className="mt-2 text-3xl">Create your account</h1>
          <p className="mt-2 text-sm text-muted">
            This signup is for candidates. After you register, the candidate panel opens. Employers and agency staff are given accounts by Staffora.
          </p>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium" htmlFor="name">
              Full name
              <input id="name" autoComplete="name" className="input-field mt-1" value={form.name} onChange={(event) => set('name', event.target.value)} aria-invalid={errors.name ? 'true' : undefined} />
              {errors.name ? <span className="mt-1 block text-sm text-accent">{errors.name}</span> : null}
            </label>
            <label className="block text-sm font-medium" htmlFor="email">
              Email
              <input id="email" type="email" autoComplete="email" className="input-field mt-1" value={form.email} onChange={(event) => set('email', event.target.value)} aria-invalid={errors.email ? 'true' : undefined} />
              {errors.email ? <span className="mt-1 block text-sm text-accent">{errors.email}</span> : null}
            </label>
            <label className="block text-sm font-medium" htmlFor="password">
              Password
              <input id="password" type="password" autoComplete="new-password" className="input-field mt-1" value={form.password} onChange={(event) => set('password', event.target.value)} aria-invalid={errors.password ? 'true' : undefined} />
              {errors.password ? <span className="mt-1 block text-sm text-accent">{errors.password}</span> : null}
            </label>
            <label className="block text-sm font-medium" htmlFor="confirm">
              Confirm password
              <input id="confirm" type="password" autoComplete="new-password" className="input-field mt-1" value={form.confirm} onChange={(event) => set('confirm', event.target.value)} aria-invalid={errors.confirm ? 'true' : undefined} />
              {errors.confirm ? <span className="mt-1 block text-sm text-accent">{errors.confirm}</span> : null}
            </label>
            <label className="flex items-start gap-2 text-sm" htmlFor="consent">
              <input id="consent" type="checkbox" className="mt-1" checked={form.consent} onChange={(event) => set('consent', event.target.checked)} />
              <span>I agree to use this account as a candidate on Staffora.</span>
            </label>
            {errors.consent ? <p className="text-sm text-accent">{errors.consent}</p> : null}
          </div>
          {formError ? <p className="mt-4 text-sm text-accent" role="alert">{formError}</p> : null}
          <Button type="submit" className="mt-6 w-full">Create candidate account</Button>
          <p className="mt-4 text-sm text-muted">
            Already registered? <Link className="font-medium text-accent" to="/login">Sign in</Link>
          </p>
        </form>
      </Container>
    </section>
  )
}
