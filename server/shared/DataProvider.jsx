import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken } from './api.js'

const DataContext = createContext(null)

const empty = {
  companies: [],
  agencyUsers: [],
  employerUsers: [],
  candidates: [],
  staffingRequests: [],
  jobs: [],
  applications: [],
  interviews: [],
  placements: [],
  workers: [],
  timesheets: [],
  documents: [],
  payrollPeriods: [],
  payrollEntries: [],
  invoices: [],
  notifications: [],
  auditEvents: [],
  rolesMatrix: [],
  savedJobIds: [],
  candidateProfileId: null,
  companyId: null,
  ready: false,
  loadError: '',
}

export function DataProvider({ children, audience }) {
  const [state, setState] = useState(empty)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setState((prev) => ({ ...prev, ready: true }))
      return null
    }
    const data = await api('/api/state')
    setState({ ...empty, ...data, ready: true, loadError: '' })
    return data
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!getToken()) {
      setState((prev) => ({ ...prev, ready: true }))
      return undefined
    }
    api('/api/state')
      .then((data) => {
        if (!cancelled) setState({ ...empty, ...data, ready: true, loadError: '' })
      })
      .catch((error) => {
        if (!cancelled) setState((prev) => ({ ...prev, ready: true, loadError: error.message }))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const commit = useCallback(async (path, options) => {
    const data = await api(path, options)
    await refresh()
    return data
  }, [refresh])

  const value = useMemo(() => ({
    state,
    audience,
    async list(collection) {
      return state[collection] || []
    },
    async getById(collection, id) {
      return (state[collection] || []).find((item) => item.id === id) || null
    },
    updateCollection(collection, updater) {
      setState((prev) => ({ ...prev, [collection]: updater(prev[collection] || []) }))
    },
    setCompanyId(companyId) {
      setState((prev) => ({ ...prev, companyId }))
    },
    setCandidateProfileId(candidateProfileId) {
      setState((prev) => ({ ...prev, candidateProfileId }))
    },
    toggleSavedJob(jobId) {
      return commit('/api/saved-jobs/toggle', { method: 'POST', body: JSON.stringify({ jobId }) })
    },
    createCompany(payload) {
      return commit('/api/companies', { method: 'POST', body: JSON.stringify(payload) })
    },
    createStaffingRequest(payload) {
      return commit('/api/staffing-requests', { method: 'POST', body: JSON.stringify(payload) })
    },
    updateStaffingRequest(id, updates) {
      return commit(`/api/staffing-requests/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
    },
    updateTimesheet(id, updates) {
      return commit(`/api/timesheets/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
    },
    createApplication(payload) {
      return commit('/api/applications', { method: 'POST', body: JSON.stringify(payload) })
    },
    updateApplication(id, updates) {
      return commit(`/api/applications/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
    },
    updateCandidate(id, updates) {
      return commit(`/api/candidates/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
    },
    updateJob(id, updates) {
      return commit(`/api/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
    },
    createJob(payload) {
      return commit('/api/jobs', { method: 'POST', body: JSON.stringify(payload) })
    },
    createInterview(payload) {
      return commit('/api/interviews', { method: 'POST', body: JSON.stringify(payload) })
    },
    updateInterview(id, updates) {
      return commit(`/api/interviews/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
    },
    createPlacement(payload) {
      return commit('/api/placements', { method: 'POST', body: JSON.stringify(payload) })
    },
    createInvoice(payload) {
      return commit('/api/invoices', { method: 'POST', body: JSON.stringify(payload) })
    },
    updateInvoice(id, updates) {
      return commit(`/api/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
    },
    updateCompany(id, updates) {
      return commit(`/api/companies/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
    },
    updatePayrollEntry(id, updates) {
      return commit(`/api/payroll-entries/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
    },
    markNotificationRead(id) {
      return commit(`/api/notifications/${id}`, { method: 'PATCH', body: JSON.stringify({ read: true }) })
    },
    async markAllNotificationsRead(predicate) {
      const ids = state.notifications.filter((note) => predicate(note) && !note.read).map((note) => note.id)
      if (!ids.length) return { notifications: [] }
      return commit('/api/notifications/read', { method: 'POST', body: JSON.stringify({ ids }) })
    },
    addDocument(payload) {
      return commit('/api/documents', { method: 'POST', body: JSON.stringify(payload) })
    },
  }), [audience, commit, state])

  if (!state.ready) {
    return <div className="grid min-h-screen place-items-center bg-cream text-sm text-muted">Loading records…</div>
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData requires DataProvider')
  return ctx
}
