import { useEffect } from 'react'
import { PORTALS } from '@staffora/auth'

export default function LoginPage() {
  useEffect(() => {
    window.location.replace(`${PORTALS.public}/login`)
  }, [])
  return <p className="p-8 text-sm text-muted">Redirecting to sign in…</p>
}
