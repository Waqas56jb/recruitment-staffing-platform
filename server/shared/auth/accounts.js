import { api, setToken } from '../api.js'

const SESSION_COOKIE = 'staffora_session'

const localPortals = {
  public: 'http://localhost:5177',
  employee: 'http://localhost:5178',
  candidate: 'http://localhost:5179',
  admin: 'http://localhost:5184',
}

const productionPortals = {
  public: 'https://recruitment-staffing-platform-clien.vercel.app',
  employee: 'https://recruitment-staffing-platform-emplo.vercel.app',
  candidate: 'https://recruitment-staffing-platform-candi.vercel.app',
  admin: 'https://recruitment-staffing-platform-admin-us-4e8d.vercel.app',
}

function portalOrigin(name, envValue) {
  const configured = String(envValue || '').trim().replace(/\/$/, '')
  if (configured) return configured
  return import.meta.env.DEV ? localPortals[name] : productionPortals[name]
}

export const PORTALS = {
  public: portalOrigin('public', import.meta.env.VITE_PUBLIC_URL),
  employee: portalOrigin('employee', import.meta.env.VITE_EMPLOYEE_URL),
  candidate: portalOrigin('candidate', import.meta.env.VITE_CANDIDATE_URL),
  admin: portalOrigin('admin', import.meta.env.VITE_ADMIN_URL),
}

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  SUB_ADMIN: 'Sub Admin',
  RECRUITER: 'Recruiter',
  HR: 'HR Manager',
  PAYROLL: 'Payroll Manager',
  FINANCE: 'Finance Manager',
  COMPANY_ADMIN: 'Company Admin',
  HIRING_MANAGER: 'Hiring Manager',
  CANDIDATE: 'Candidate',
}

function readCookie(name) {
  if (typeof document === 'undefined') return null
  const prefix = `${name}=`
  const match = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix))
  if (!match) return null
  return decodeURIComponent(match.slice(prefix.length))
}

function writeCookie(name, value) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=2592000; SameSite=Lax`
}

function clearCookie(name) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function toSession(account) {
  if (!account) return null
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    portal: account.portal,
    companyId: account.companyId || null,
    candidateId: account.candidateId || null,
    status: account.status || 'Active',
    token: account.token || null,
  }
}

function persistSession(session) {
  if (session?.token) setToken(session.token)
  writeCookie(SESSION_COOKIE, JSON.stringify(session))
}

export function readStoredSession() {
  const cookie = readCookie(SESSION_COOKIE)
  if (!cookie) return null
  try {
    return JSON.parse(cookie)
  } catch {
    return null
  }
}

export function clearSession() {
  clearCookie(SESSION_COOKIE)
  setToken(null)
}

function consumeHash(portal) {
  if (typeof window === 'undefined') return null
  const marker = '#staffora='
  if (!window.location.hash.startsWith(marker)) return null
  try {
    const session = JSON.parse(decodeURIComponent(window.location.hash.slice(marker.length)))
    const clean = `${window.location.pathname}${window.location.search}`
    window.history.replaceState(null, '', clean)
    if (session?.portal !== portal) return null
    persistSession(session)
    return session
  } catch {
    return null
  }
}

export function loadPortalSession(portal) {
  const fromHash = consumeHash(portal)
  if (fromHash) return fromHash
  const stored = readStoredSession()
  if (stored?.portal === portal) {
    if (stored.token) setToken(stored.token)
    return stored
  }
  return null
}

export function panelUrl(session) {
  const origin = PORTALS[session.portal]
  const payload = encodeURIComponent(JSON.stringify(toSession(session)))
  return `${origin}/dashboard#staffora=${payload}`
}

export function redirectToPanel(session) {
  const next = toSession(session)
  persistSession(next)
  window.location.assign(panelUrl(next))
}

export async function authenticate(email, password) {
  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const session = toSession({ ...data.session, token: data.token })
    persistSession(session)
    return { session }
  } catch (error) {
    return { error: error.message || 'Email or password is incorrect.' }
  }
}

export async function registerCandidate({ name, email, password }) {
  try {
    const data = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    const session = toSession({ ...data.session, token: data.token })
    persistSession(session)
    return { session }
  } catch (error) {
    return { error: error.message || 'Could not create the account.' }
  }
}

export function canViewPasswords(actor) {
  return actor?.role === ROLES.SUPER_ADMIN
}

export function creatableRoles(actor) {
  if (actor?.role === ROLES.SUPER_ADMIN) return [ROLES.ADMIN, ROLES.SUB_ADMIN]
  if (actor?.role === ROLES.ADMIN) return [ROLES.SUB_ADMIN]
  return []
}

export function accountsVisibleTo(actor, accounts) {
  if (actor?.role === ROLES.SUPER_ADMIN) return accounts
  if (actor?.role === ROLES.ADMIN) return accounts.filter((item) => item.role === ROLES.SUB_ADMIN)
  return []
}

export function canDeleteAccount(actor, target) {
  if (actor?.role !== ROLES.SUPER_ADMIN) return false
  if (!target || actor.id === target.id) return false
  return true
}

export function canChangePassword(actor) {
  return actor?.role === ROLES.SUPER_ADMIN
}

export async function readAccounts() {
  const data = await api('/api/users')
  return data.accounts || []
}

export async function createStaffAccount(actor, input) {
  const allowed = creatableRoles(actor)
  if (!allowed.includes(input.role)) return { error: 'You cannot create this type of account.' }
  try {
    const data = await api('/api/users', { method: 'POST', body: JSON.stringify(input) })
    return { account: data.account }
  } catch (error) {
    return { error: error.message }
  }
}

export async function deleteAccount(actor, id) {
  if (actor?.role !== ROLES.SUPER_ADMIN) return { error: 'You cannot delete this account.' }
  if (actor.id === id) return { error: 'You cannot delete your own account.' }
  try {
    await api(`/api/users/${id}`, { method: 'DELETE' })
    return { ok: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function changePassword(actor, id, password) {
  if (!canChangePassword(actor)) return { error: 'You cannot change credentials.' }
  try {
    await api(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify({ password }) })
    return { ok: true }
  } catch (error) {
    return { error: error.message }
  }
}
