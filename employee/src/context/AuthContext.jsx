import { createContext, useContext, useMemo, useState } from 'react'
import { clearSession, loadPortalSession } from '@staffora/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children, portal }) {
  const [user, setUser] = useState(() => loadPortalSession(portal))

  const value = useMemo(() => ({
    user,
    portal,
    signOut() {
      clearSession()
      setUser(null)
    },
  }), [portal, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth requires AuthProvider')
  return ctx
}
