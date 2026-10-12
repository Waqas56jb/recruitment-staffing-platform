const configuredOrigin = import.meta.env.VITE_API_ORIGIN
export const API_ORIGIN = String(
  configuredOrigin || (import.meta.env.DEV ? 'http://localhost:5080' : 'https://recruitment-staffing-platform.vercel.app'),
).replace(/\/$/, '')
const TOKEN_KEY = 'staffora-token'

export function getToken() {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (typeof localStorage === 'undefined') return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_ORIGIN}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed')
    error.status = response.status
    throw error
  }
  return data
}
