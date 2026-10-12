import { useEffect } from 'react'
import { redirectToPublicLogin } from '@staffora/auth'
import LoadingState from '../ui/LoadingState'

// Panels have no login screen of their own: send users to the website login.
export default function SiteLoginRedirect() {
  useEffect(() => {
    redirectToPublicLogin()
  }, [])
  return <LoadingState />
}
