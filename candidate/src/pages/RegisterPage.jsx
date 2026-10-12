import { useEffect } from 'react'
import { PORTALS } from '@staffora/auth'

export default function RegisterPage() {
  useEffect(() => {
    window.location.replace(`${PORTALS.public}/register`)
  }, [])
  return <p className="p-8 text-sm text-muted">Redirecting to candidate registration…</p>
}
