import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))), '../..')

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

const storeCommon = `import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as seed from '../mock/seed'
import { invoiceTotals } from '../mock/seed'
import { uid } from '../utils/format'

function clone(data) {
  return structuredClone(data)
}

function delay(ms = 180) {
  return new Promise((r) => setTimeout(r, ms))
}

const DataContext = createContext(null)

export function DataProvider({ children, audience }) {
  const [state, setState] = useState(() => ({
    companies: clone(seed.companies),
    agencyUsers: clone(seed.agencyUsers),
    employerUsers: clone(seed.employerUsers),
    candidates: clone(seed.candidates),
    staffingRequests: clone(seed.staffingRequests),
    jobs: clone(seed.jobs),
    applications: clone(seed.applications),
    interviews: clone(seed.interviews),
    placements: clone(seed.placements),
    workers: clone(seed.workers),
    timesheets: clone(seed.timesheets),
    documents: clone(seed.documents),
    payrollPeriods: clone(seed.payrollPeriods),
    payrollEntries: clone(seed.payrollEntries),
    invoices: clone(seed.invoices).map((inv) => ({ ...inv, ...invoiceTotals(inv) })),
    notifications: clone(seed.notifications),
    auditEvents: clone(seed.auditEvents),
    rolesMatrix: clone(seed.rolesMatrix),
    savedJobIds: ['job-admin'],
    candidateProfileId: 'cand-mia',
    companyId: 'co-northline',
  }))

  const patch = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      return next
    })
  }, [])

  const addAudit = useCallback((event) => {
    patch((prev) => ({
      ...prev,
      auditEvents: [{ id: uid('aud'), timestamp: new Date().toISOString(), ...event }, ...prev.auditEvents],
    }))
  }, [patch])

  const api = useMemo(() => ({
    state,
    audience,
    async list(collection) {
      await delay()
      return state[collection] || []
    },
    async getById(collection, id) {
      await delay()
      return (state[collection] || []).find((item) => item.id === id) || null
    },
    updateCollection(collection, updater) {
      patch((prev) => ({ ...prev, [collection]: updater(prev[collection] || []) }))
    },
    setCompanyId(companyId) {
      patch({ companyId })
    },
    setCandidateProfileId(candidateProfileId) {
      patch({ candidateProfileId })
    },
    toggleSavedJob(jobId) {
      patch((prev) => {
        const exists = prev.savedJobIds.includes(jobId)
        return {
          ...prev,
          savedJobIds: exists ? prev.savedJobIds.filter((id) => id !== jobId) : [...prev.savedJobIds, jobId],
        }
      })
    },
    createStaffingRequest(payload) {
      const item = {
        id: uid('sr'),
        companyId: state.companyId,
        recruiterId: null,
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        ...payload,
      }
      patch((prev) => ({ ...prev, staffingRequests: [item, ...prev.staffingRequests] }))
      addAudit({ actor: 'Employer demo user', action: 'staffingRequest.created', entityType: 'StaffingRequest', entityId: item.id, summary: 'Created staffing request ' + item.title })
      return item
    },
    updateStaffingRequest(id, updates) {
      let updated = null
      patch((prev) => ({
        ...prev,
        staffingRequests: prev.staffingRequests.map((item) => {
          if (item.id !== id) return item
          updated = { ...item, ...updates, updatedAt: new Date().toISOString().slice(0, 10) }
          return updated
        }),
      }))
      if (updated) addAudit({ actor: 'Demo user', action: 'staffingRequest.updated', entityType: 'StaffingRequest', entityId: id, summary: 'Updated request ' + id })
      return updated
    },
    updateTimesheet(id, updates) {
      let updated = null
      patch((prev) => ({
        ...prev,
        timesheets: prev.timesheets.map((item) => {
          if (item.id !== id) return item
          updated = { ...item, ...updates }
          return updated
        }),
      }))
      if (updated) addAudit({ actor: 'Demo user', action: 'timesheet.updated', entityType: 'Timesheet', entityId: id, summary: 'Timesheet ' + id + ' -> ' + updated.status })
      return updated
    },
    createApplication(payload) {
      const duplicate = state.applications.find((a) => a.candidateId === payload.candidateId && a.jobId === payload.jobId && a.status !== 'Withdrawn')
      if (duplicate) throw new Error('You already have an active application for this demo job.')
      const item = {
        id: uid('app'),
        appliedAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        timeline: [{ status: 'Submitted', at: new Date().toISOString().slice(0, 10), note: 'Application captured locally (demo)' }],
        ...payload,
      }
      patch((prev) => ({ ...prev, applications: [item, ...prev.applications] }))
      addAudit({ actor: 'Candidate demo user', action: 'application.created', entityType: 'Application', entityId: item.id, summary: 'Submitted demo application' })
      return item
    },
    updateApplication(id, updates) {
      let updated = null
      patch((prev) => ({
        ...prev,
        applications: prev.applications.map((item) => {
          if (item.id !== id) return item
          const timeline = updates.status && updates.status !== item.status
            ? [...item.timeline, { status: updates.status, at: new Date().toISOString().slice(0, 10), note: updates.note || 'Status updated (demo)' }]
            : item.timeline
          updated = { ...item, ...updates, timeline, updatedAt: new Date().toISOString().slice(0, 10) }
          return updated
        }),
      }))
      return updated
    },
    updateCandidate(id, updates) {
      let updated = null
      patch((prev) => ({
        ...prev,
        candidates: prev.candidates.map((item) => {
          if (item.id !== id) return item
          updated = { ...item, ...updates }
          return updated
        }),
      }))
      return updated
    },
    updateJob(id, updates) {
      let updated = null
      patch((prev) => ({
        ...prev,
        jobs: prev.jobs.map((item) => {
          if (item.id !== id) return item
          updated = { ...item, ...updates }
          return updated
        }),
      }))
      return updated
    },
    createJob(payload) {
      const item = { id: uid('job'), postedAt: new Date().toISOString().slice(0, 10), isSample: true, status: 'Draft', ...payload }
      patch((prev) => ({ ...prev, jobs: [item, ...prev.jobs] }))
      return item
    },
    createInterview(payload) {
      const item = { id: uid('int'), status: 'Scheduled', feedback: '', ...payload }
      patch((prev) => ({ ...prev, interviews: [item, ...prev.interviews] }))
      addAudit({ actor: 'Admin demo user', action: 'interview.scheduled', entityType: 'Interview', entityId: item.id, summary: 'Scheduled demo interview' })
      return item
    },
    updateInterview(id, updates) {
      let updated = null
      patch((prev) => ({
        ...prev,
        interviews: prev.interviews.map((item) => {
          if (item.id !== id) return item
          updated = { ...item, ...updates }
          return updated
        }),
      }))
      return updated
    },
    createPlacement(payload) {
      const workerId = uid('wk')
      const placement = {
        id: uid('pl'),
        workerId,
        status: 'Confirmed',
        recruiterId: 'usr-recruiter',
        contractRef: 'CTR-DEMO-' + Math.floor(Math.random() * 900 + 100),
        ...payload,
      }
      const worker = {
        id: workerId,
        placementId: placement.id,
        candidateId: placement.candidateId,
        companyId: placement.companyId,
        displayName: state.candidates.find((c) => c.id === placement.candidateId)?.fullName || 'Worker',
        role: placement.role,
        department: placement.department,
        location: placement.location,
        employmentType: placement.employmentType,
        pattern: payload.pattern || 'Standard',
        status: 'Assigned',
        startDate: placement.startDate,
        endDate: placement.endDate || null,
      }
      patch((prev) => ({
        ...prev,
        placements: [placement, ...prev.placements],
        workers: [worker, ...prev.workers],
      }))
      addAudit({ actor: 'Admin demo user', action: 'placement.created', entityType: 'Placement', entityId: placement.id, summary: 'Created demo placement + worker' })
      return { placement, worker }
    },
    createInvoice(payload) {
      const base = { id: uid('inv'), number: 'INV-DEMO-' + Date.now().toString().slice(-6), taxRate: 0.2, status: 'Draft', ...payload }
      const totals = invoiceTotals(base)
      const item = { ...base, ...totals }
      patch((prev) => ({ ...prev, invoices: [item, ...prev.invoices] }))
      addAudit({ actor: 'Finance demo user', action: 'invoice.created', entityType: 'Invoice', entityId: item.id, summary: 'Created demo invoice' })
      return item
    },
    updateInvoice(id, updates) {
      let updated = null
      patch((prev) => ({
        ...prev,
        invoices: prev.invoices.map((item) => {
          if (item.id !== id) return item
          const next = { ...item, ...updates }
          const totals = invoiceTotals(next)
          updated = { ...next, ...totals }
          return updated
        }),
      }))
      return updated
    },
    updateCompany(id, updates) {
      let updated = null
      patch((prev) => ({
        ...prev,
        companies: prev.companies.map((item) => {
          if (item.id !== id) return item
          updated = { ...item, ...updates }
          return updated
        }),
      }))
      return updated
    },
    updatePayrollEntry(id, updates) {
      let updated = null
      patch((prev) => ({
        ...prev,
        payrollEntries: prev.payrollEntries.map((item) => {
          if (item.id !== id) return item
          updated = { ...item, ...updates }
          return updated
        }),
      }))
      return updated
    },
    markNotificationRead(id) {
      patch((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }))
    },
    markAllNotificationsRead(predicate) {
      patch((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => (predicate(n) ? { ...n, read: true } : n)),
      }))
    },
    addDocument(payload) {
      const item = { id: uid('doc'), status: 'Active', issuedAt: new Date().toISOString().slice(0, 10), ...payload }
      patch((prev) => ({ ...prev, documents: [item, ...prev.documents] }))
      return item
    },
  }), [addAudit, audience, patch, state])

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData requires DataProvider')
  return ctx
}
`

const authCommon = `import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const DEMO_USERS = {
  employee: {
    email: 'priya.shah@northline.example',
    name: 'Priya Shah',
    role: 'Company Admin',
    companyId: 'co-northline',
  },
  candidate: {
    email: 'mia.chen@example.com',
    name: 'Mia Chen',
    role: 'Candidate',
    candidateId: 'cand-mia',
  },
  admin: {
    email: 'sophie@staffora.example',
    name: 'Sophie Lane',
    role: 'Recruiter',
  },
}

export function AuthProvider({ children, portal }) {
  const storageKey = 'staffora-demo-auth-' + portal
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const value = useMemo(() => ({
    user,
    portal,
    demoUser: DEMO_USERS[portal],
    signIn(email) {
      const demo = DEMO_USERS[portal]
      const next = { ...demo, email: email || demo.email, demo: true }
      sessionStorage.setItem(storageKey, JSON.stringify(next))
      setUser(next)
      return next
    },
    signOut() {
      sessionStorage.removeItem(storageKey)
      setUser(null)
    },
  }), [portal, storageKey, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth requires AuthProvider')
  return ctx
}
`

const loginPage = (portal, subtitle, extras = '') => `import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { email as emailRule, required } from '../utils/validation'

export default function LoginPage() {
  const { user, signIn, demoUser } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState(demoUser.email)
  const [password, setPassword] = useState('demo-only')
  const [errors, setErrors] = useState({})

  if (user) return <Navigate to="/dashboard" replace />

  const onSubmit = (e) => {
    e.preventDefault()
    const next = {
      email: required(email) || emailRule(email),
      password: required(password, 'Enter any demo password'),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    signIn(email)
    push({ title: 'Demo signed in', message: 'This is simulated authentication only. No credentials were verified against a server.' })
    navigate('/dashboard')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink text-cream">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200_16_46_/_0.35),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(201_161_74_/_0.2),transparent_35%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-16 lg:flex-row lg:items-center lg:gap-16">
        <div className="max-w-xl">
          <p className="eyebrow text-gold-soft">Staffora · ${portal}</p>
          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase leading-none tracking-tight sm:text-6xl">${subtitle}</h1>
          <p className="mt-5 text-cream/75">Demonstration sign-in for the frontend portal. No real authentication, passwords, or tokens are processed.</p>
          ${extras}
        </div>
        <form onSubmit={onSubmit} className="mt-10 w-full max-w-md rounded-2xl border border-cream/15 bg-white p-6 text-ink shadow-lift sm:p-8 lg:mt-0">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">Demo credentials prefilled</p>
          <div className="mt-5 space-y-4">
            <Field id="email" label="Email" required error={errors.email}>
              <input id="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field id="password" label="Password" required error={errors.password} hint="Any value works in this demo.">
              <input id="password" type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
          </div>
          <Button type="submit" className="mt-6 w-full" size="lg">Sign in to demo</Button>
          <p className="mt-4 text-xs text-muted">Demo user: {demoUser.name} · {demoUser.role}</p>
        </form>
      </div>
    </div>
  )
}
`

for (const app of ['employee', 'candidate', 'admin']) {
  const base = path.join(root, app)
  write(path.join(base, 'src/context/DataContext.jsx'), storeCommon)
  write(path.join(base, 'src/context/AuthContext.jsx'), authCommon)
}

write(path.join(root, 'employee/src/pages/LoginPage.jsx'), loginPage('Employer Portal', 'Your workforce control centre', `<ul class="mt-6 space-y-2 text-sm text-cream/65"><li>• Staffing requests & candidate review</li><li>• Placements, timesheets & invoices</li></ul>`))
write(path.join(root, 'candidate/src/pages/LoginPage.jsx'), loginPage('Candidate Portal', 'Your career workspace', `<ul class="mt-6 space-y-2 text-sm text-cream/65"><li>• Profile, documents & applications</li><li>• Sample jobs and interview tracking</li></ul>`))
write(path.join(root, 'admin/src/pages/LoginPage.jsx'), loginPage('Admin Console', 'Agency operations dashboard', `<ul class="mt-6 space-y-2 text-sm text-cream/65"><li>• Companies, recruitment & placements</li><li>• Timesheets, payroll prep & invoices</li></ul>`))

console.log('Stores and login pages written')
