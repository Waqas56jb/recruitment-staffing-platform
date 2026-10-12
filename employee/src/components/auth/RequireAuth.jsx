import { useAuth } from '../../context/AuthContext'
import SiteLoginRedirect from './SiteLoginRedirect'

export default function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <SiteLoginRedirect />
  return children
}
