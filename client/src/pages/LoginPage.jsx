import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authenticate, redirectToPanel } from '@staffora/auth'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import { email as emailRule, required } from '../utils/validation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    const next = {
      email: required(email) || emailRule(email),
      password: required(password, 'Enter your password'),
    }
    setErrors(next)
    setFormError('')
    if (Object.values(next).some(Boolean)) return
    const result = await authenticate(email, password)
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
          <p className="eyebrow">Staffora</p>
          <h1 className="mt-2 text-3xl">Sign in</h1>
          <p className="mt-2 text-sm text-muted">
            Candidates, employers, and agency staff use this page. Your account opens the matching panel.
          </p>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium" htmlFor="email">
              Email
              <input id="email" type="email" autoComplete="username" className="input-field mt-1" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={errors.email ? 'true' : undefined} />
              {errors.email ? <span className="mt-1 block text-sm text-accent">{errors.email}</span> : null}
            </label>
            <label className="block text-sm font-medium" htmlFor="password">
              Password
              <input id="password" type="password" autoComplete="current-password" className="input-field mt-1" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={errors.password ? 'true' : undefined} />
              {errors.password ? <span className="mt-1 block text-sm text-accent">{errors.password}</span> : null}
            </label>
          </div>
          {formError ? <p className="mt-4 text-sm text-accent" role="alert">{formError}</p> : null}
          <Button type="submit" className="mt-6 w-full">Sign in</Button>
          <p className="mt-4 text-sm text-muted">
            New candidate? <Link className="font-medium text-accent" to="/register">Create an account</Link>
          </p>
        </form>
      </Container>
    </section>
  )
}
