require('dotenv').config({ path: require('path').join(__dirname, '.env') })

const crypto = require('crypto')
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Pool } = require('pg')

const PREFIX = 'recruitment_staffing_platform_'
const T = {
  users: `${PREFIX}users`,
  companies: `${PREFIX}companies`,
  candidates: `${PREFIX}candidates`,
  staffing_requests: `${PREFIX}staffing_requests`,
  jobs: `${PREFIX}jobs`,
  applications: `${PREFIX}applications`,
  interviews: `${PREFIX}interviews`,
  placements: `${PREFIX}placements`,
  workers: `${PREFIX}workers`,
  timesheets: `${PREFIX}timesheets`,
  documents: `${PREFIX}documents`,
  payroll_periods: `${PREFIX}payroll_periods`,
  payroll_entries: `${PREFIX}payroll_entries`,
  invoices: `${PREFIX}invoices`,
  notifications: `${PREFIX}notifications`,
  audit_events: `${PREFIX}audit_events`,
  enquiries: `${PREFIX}enquiries`,
  saved_jobs: `${PREFIX}saved_jobs`,
}

const RECORD_TABLES = [
  'companies',
  'candidates',
  'staffing_requests',
  'jobs',
  'applications',
  'interviews',
  'placements',
  'workers',
  'timesheets',
  'documents',
  'payroll_periods',
  'payroll_entries',
  'invoices',
  'notifications',
  'audit_events',
  'enquiries',
]

const AGENCY_ROLES = new Set([
  'Super Admin',
  'Admin',
  'Sub Admin',
  'Recruiter',
  'HR Manager',
  'Payroll Manager',
  'Finance Manager',
  'Agency Administrator',
])

const ROLES_MATRIX = [
  { role: 'Super Admin', modules: ['All modules', 'See every password', 'Create admins and sub admins', 'Delete accounts'] },
  { role: 'Admin', modules: ['Create sub admins only', 'Cannot see, edit, or delete admin credentials'] },
  { role: 'Sub Admin', modules: ['Cannot create admins', 'Cannot see or change anyone’s credentials'] },
  { role: 'Agency Administrator', modules: ['Companies', 'Candidates', 'Requests', 'Jobs', 'Recruitment', 'Users'] },
  { role: 'Recruiter', modules: ['Candidates', 'Requests', 'Jobs', 'Recruitment', 'Interviews', 'Placements'] },
  { role: 'HR Manager', modules: ['Candidates', 'Interviews', 'Documents', 'Workforce'] },
  { role: 'Payroll Manager', modules: ['Timesheets', 'Payroll', 'Workforce'] },
  { role: 'Finance Manager', modules: ['Invoices', 'Reports', 'Documents'] },
]

const PORTALS = new Set([
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5184',
  'https://recruitment-staffing-platform-clien.vercel.app',
  'https://recruitment-staffing-platform-emplo.vercel.app',
  'https://recruitment-staffing-platform-candi.vercel.app',
  'https://recruitment-staffing-platform-admin-us-4e8d.vercel.app',
  ...String(process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
])

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 6543),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 4,
})

function table(name) {
  const value = T[name]
  if (!value || !value.startsWith(PREFIX) || !/^[a-z0-9_]+$/.test(value)) {
    throw new Error('Refusing to touch a table outside recruitment_staffing_platform_.')
  }
  return value
}

function nid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function fail(status, message) {
  const error = new Error(message)
  error.status = status
  throw error
}

function isAgency(user) {
  return user?.portal === 'admin' || AGENCY_ROLES.has(user?.role)
}

function isEmployer(user) {
  return user?.portal === 'employee'
}

function isCandidate(user) {
  return user?.portal === 'candidate'
}

function invoiceTotals(invoice) {
  const items = Array.isArray(invoice.lineItems) ? invoice.lineItems : []
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitRate || 0), 0)
  const taxRate = Number(invoice.taxRate ?? 0.2)
  const tax = Number((subtotal * taxRate).toFixed(2))
  const total = Number((subtotal + tax).toFixed(2))
  return { subtotal: Number(subtotal.toFixed(2)), taxRate, tax, total }
}

function publicUser(row, includePassword = false) {
  const payload = row.payload || {}
  const user = {
    id: row.id,
    name: payload.name || '',
    email: row.email,
    role: row.role,
    portal: row.portal,
    companyId: row.company_id || null,
    candidateId: row.candidate_id || null,
    status: row.status || 'Active',
    settings: payload.settings || {},
  }
  if (includePassword) user.password = row.password_plain || ''
  return user
}

async function listRecords(name) {
  const { rows } = await pool.query(`select payload from ${table(name)} order by created_at desc`)
  return rows.map((row) => row.payload)
}

async function getRecord(name, id) {
  const { rows } = await pool.query(`select payload from ${table(name)} where id = $1`, [id])
  return rows[0]?.payload || null
}

async function insertRecord(name, record) {
  await pool.query(`insert into ${table(name)} (id, payload) values ($1, $2::jsonb)`, [record.id, JSON.stringify(record)])
  return record
}

async function saveRecord(name, record) {
  await pool.query(`update ${table(name)} set payload = $2::jsonb where id = $1`, [record.id, JSON.stringify(record)])
  return record
}

async function audit(actor, action, entityType, entityId, summary) {
  const event = {
    id: nid('aud'),
    timestamp: new Date().toISOString(),
    actor: actor?.name || 'System',
    action,
    entityType,
    entityId,
    summary,
  }
  await insertRecord('audit_events', event)
  return event
}

async function notify(audience, title, body, href) {
  const note = {
    id: nid('ntf'),
    audience,
    title,
    body,
    href: href || '',
    createdAt: new Date().toISOString(),
    read: false,
  }
  await insertRecord('notifications', note)
  return note
}

async function ensureSchema() {
  for (const name of Object.keys(T)) table(name)

  await pool.query(`create table if not exists ${table('users')} (
    id text primary key,
    email text unique not null,
    password_hash text not null,
    password_plain text,
    role text not null,
    portal text not null,
    company_id text,
    candidate_id text,
    status text not null default 'Active',
    payload jsonb not null,
    created_at timestamptz not null default now()
  )`)

  for (const name of RECORD_TABLES) {
    await pool.query(`create table if not exists ${table(name)} (
      id text primary key,
      payload jsonb not null,
      created_at timestamptz not null default now()
    )`)
  }

  await pool.query(`create table if not exists ${table('saved_jobs')} (
    id text primary key,
    user_id text not null,
    job_id text not null,
    created_at timestamptz not null default now(),
    unique (user_id, job_id)
  )`)

  const existing = await pool.query(`select id from ${table('users')} where role = 'Super Admin' limit 1`)
  if (!existing.rows.length) {
    const email = String(process.env.BOOTSTRAP_ADMIN_EMAIL || 'superadmin@staffora.com').trim().toLowerCase()
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'ChangeMe_Staffora_2026'
    const name = process.env.BOOTSTRAP_ADMIN_NAME || 'Super Admin'
    const userId = nid('usr')
    const payload = {
      id: userId,
      name,
      email,
      role: 'Super Admin',
      portal: 'admin',
      companyId: null,
      candidateId: null,
      status: 'Active',
      settings: {},
    }
    const hash = await bcrypt.hash(password, 10)
    await pool.query(
      `insert into ${table('users')} (id, email, password_hash, password_plain, role, portal, company_id, candidate_id, status, payload)
       values ($1,$2,$3,$4,'Super Admin','admin',null,null,'Active',$5::jsonb)`,
      [userId, email, hash, password, JSON.stringify(payload)],
    )
  }
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, portal: user.portal },
    process.env.JWT_SECRET,
    { expiresIn: '14d' },
  )
}

async function loadUser(userId, includePassword = false) {
  const columns = includePassword
    ? 'id, email, role, portal, company_id, candidate_id, status, payload, password_plain'
    : 'id, email, role, portal, company_id, candidate_id, status, payload'
  const { rows } = await pool.query(`select ${columns} from ${table('users')} where id = $1`, [userId])
  if (!rows.length) return null
  return publicUser(rows[0], includePassword)
}

async function requireUser(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) return res.status(401).json({ error: 'Sign in required.' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await loadUser(decoded.sub)
    if (!user || user.status !== 'Active') return res.status(401).json({ error: 'This account is not active.' })
    req.user = user
    return next()
  } catch {
    return res.status(401).json({ error: 'Sign in required.' })
  }
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch((error) => {
      const status = error.status || 500
      if (status >= 500) console.error(error)
      res.status(status).json({ error: status >= 500 ? 'Something went wrong.' : error.message })
    })
  }
}

function requireAgency(user) {
  if (!isAgency(user)) fail(403, 'Agency access is required.')
}

function ownsCompany(user, companyId) {
  if (isAgency(user)) return true
  return isEmployer(user) && user.companyId && user.companyId === companyId
}

function assertCompany(user, companyId) {
  if (!ownsCompany(user, companyId)) fail(403, 'You cannot change records for this company.')
}

function canSeeNotification(user, note) {
  if (isAgency(user)) return true
  if (isEmployer(user)) return note.audience === `employer:${user.companyId}`
  if (isCandidate(user)) return note.audience === `candidate:${user.candidateId}`
  return false
}

function creatableRoles(actor) {
  if (actor.role === 'Super Admin') return ['Admin', 'Sub Admin']
  if (actor.role === 'Admin') return ['Sub Admin']
  return []
}

function scopeState(user, bag) {
  const base = {
    ...bag,
    rolesMatrix: ROLES_MATRIX,
    candidateProfileId: user.candidateId || null,
    companyId: user.companyId || null,
  }
  if (isAgency(user)) return base

  if (isEmployer(user)) {
    const companyId = user.companyId
    const jobs = bag.jobs.filter((job) => job.companyId === companyId)
    const jobIds = new Set(jobs.map((job) => job.id))
    const applications = bag.applications.filter((item) => jobIds.has(item.jobId))
    const candidateIds = new Set([
      ...applications.map((item) => item.candidateId),
      ...bag.placements.filter((item) => item.companyId === companyId).map((item) => item.candidateId),
      ...bag.interviews.filter((item) => item.companyId === companyId).map((item) => item.candidateId),
    ])
    return {
      ...base,
      companies: bag.companies.filter((item) => item.id === companyId),
      candidates: bag.candidates.filter((item) => candidateIds.has(item.id)),
      staffingRequests: bag.staffingRequests.filter((item) => item.companyId === companyId),
      jobs,
      applications,
      interviews: bag.interviews.filter((item) => item.companyId === companyId),
      placements: bag.placements.filter((item) => item.companyId === companyId),
      workers: bag.workers.filter((item) => item.companyId === companyId),
      timesheets: bag.timesheets.filter((item) => item.companyId === companyId),
      documents: bag.documents.filter((item) => item.companyId === companyId || candidateIds.has(item.candidateId)),
      invoices: bag.invoices.filter((item) => item.companyId === companyId),
      payrollPeriods: [],
      payrollEntries: bag.payrollEntries.filter((item) => item.companyId === companyId),
      notifications: bag.notifications.filter((item) => item.audience === `employer:${companyId}`),
      agencyUsers: [],
      employerUsers: bag.employerUsers.filter((item) => item.companyId === companyId),
      auditEvents: [],
      savedJobIds: [],
    }
  }

  const candidateId = user.candidateId
  const publishedJobs = bag.jobs.filter((job) => job.status === 'Published')
  const jobCompanyIds = new Set(publishedJobs.map((job) => job.companyId))
  return {
    ...base,
    companies: bag.companies
      .filter((item) => jobCompanyIds.has(item.id))
      .map((item) => ({ id: item.id, name: item.name, industry: item.industry, website: item.website, status: item.status })),
    candidates: bag.candidates.filter((item) => item.id === candidateId),
    jobs: publishedJobs,
    applications: bag.applications.filter((item) => item.candidateId === candidateId),
    interviews: bag.interviews.filter((item) => item.candidateId === candidateId),
    placements: bag.placements.filter((item) => item.candidateId === candidateId),
    documents: bag.documents.filter((item) => item.candidateId === candidateId),
    notifications: bag.notifications.filter((item) => item.audience === `candidate:${candidateId}`),
    staffingRequests: [],
    workers: [],
    timesheets: [],
    invoices: [],
    payrollPeriods: [],
    payrollEntries: [],
    agencyUsers: [],
    employerUsers: [],
    auditEvents: [],
  }
}

async function buildState(user) {
  const [
    companies,
    candidates,
    staffingRequests,
    jobs,
    applications,
    interviews,
    placements,
    workers,
    timesheets,
    documents,
    payrollPeriods,
    payrollEntries,
    invoices,
    notifications,
    auditEvents,
    userRows,
    savedRows,
  ] = await Promise.all([
    listRecords('companies'),
    listRecords('candidates'),
    listRecords('staffing_requests'),
    listRecords('jobs'),
    listRecords('applications'),
    listRecords('interviews'),
    listRecords('placements'),
    listRecords('workers'),
    listRecords('timesheets'),
    listRecords('documents'),
    listRecords('payroll_periods'),
    listRecords('payroll_entries'),
    listRecords('invoices'),
    listRecords('notifications'),
    listRecords('audit_events'),
    pool.query(`select id, email, role, portal, company_id, candidate_id, status, payload from ${table('users')} order by created_at desc`),
    pool.query(`select job_id from ${table('saved_jobs')} where user_id = $1`, [user.id]),
  ])
  const users = userRows.rows.map((row) => publicUser(row, false))
  return scopeState(user, {
    companies,
    candidates,
    staffingRequests,
    jobs,
    applications,
    interviews,
    placements,
    workers,
    timesheets,
    documents,
    payrollPeriods,
    payrollEntries,
    invoices,
    notifications,
    auditEvents,
    agencyUsers: users.filter((item) => item.portal === 'admin'),
    employerUsers: users.filter((item) => item.portal === 'employee'),
    savedJobIds: savedRows.rows.map((row) => row.job_id),
  })
}

async function insertUser({ name, email, password, role, portal, companyId, candidateId }) {
  const normalised = String(email || '').trim().toLowerCase()
  if (!normalised || !password || String(password).length < 8) fail(400, 'Name, email, and a password of at least 8 characters are required.')
  const existing = await pool.query(`select id from ${table('users')} where email = $1`, [normalised])
  if (existing.rows.length) fail(409, 'An account with this email already exists.')
  const userId = nid('usr')
  const payload = {
    id: userId,
    name: String(name || '').trim(),
    email: normalised,
    role,
    portal,
    companyId: companyId || null,
    candidateId: candidateId || null,
    status: 'Active',
    settings: {},
  }
  const hash = await bcrypt.hash(password, 10)
  await pool.query(
    `insert into ${table('users')} (id, email, password_hash, password_plain, role, portal, company_id, candidate_id, status, payload)
     values ($1,$2,$3,$4,$5,$6,$7,$8,'Active',$9::jsonb)`,
    [userId, normalised, hash, password, role, portal, companyId || null, candidateId || null, JSON.stringify(payload)],
  )
  return publicUser({
    id: userId,
    email: normalised,
    role,
    portal,
    company_id: companyId || null,
    candidate_id: candidateId || null,
    status: 'Active',
    payload,
    password_plain: password,
  }, true)
}

const app = express()
app.use(cors({ origin: (origin, callback) => callback(null, !origin || PORTALS.has(origin)), credentials: true }))
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', asyncRoute(async (_req, res) => {
  await pool.query('select 1')
  const tables = await pool.query(
    `select table_name from information_schema.tables where table_schema = 'public' and table_name like $1 order by table_name`,
    [`${PREFIX}%`],
  )
  res.json({ ok: true, tables: tables.rows.map((row) => row.table_name) })
}))

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const { rows } = await pool.query(`select * from ${table('users')} where email = $1`, [email])
  const row = rows[0]
  if (!row || !(await bcrypt.compare(password, row.password_hash))) fail(401, 'Email or password is incorrect.')
  if (row.status !== 'Active') fail(403, 'This account is not active.')
  const user = publicUser(row, false)
  const token = signToken(user)
  res.json({ token, session: { ...user, token } })
}))

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  if (!name) fail(400, 'Enter your full name.')
  if (String(password).length < 8) fail(400, 'Use at least 8 characters.')
  const taken = await pool.query(`select id from ${table('users')} where email = $1`, [email])
  if (taken.rows.length) fail(409, 'An account with this email already exists. Sign in instead.')

  const candidates = await listRecords('candidates')
  let candidate = candidates.find((item) => String(item.email || '').toLowerCase() === email)
  if (!candidate) {
    candidate = {
      id: nid('cand'),
      fullName: name,
      email,
      phone: '',
      city: '',
      country: '',
      headline: '',
      bio: '',
      skills: [],
      experience: [],
      education: [],
      preferences: { desiredRole: '', locations: [], employmentTypes: [], salaryExpectation: '', availabilityDate: '', relocation: false, workMode: '' },
      availability: '',
      status: 'Active',
      visibility: 'Visible to recruiters',
      cvMeta: null,
    }
    await insertRecord('candidates', candidate)
  } else {
    candidate = { ...candidate, fullName: candidate.fullName || name, status: candidate.status === 'Interest' ? 'Active' : candidate.status }
    await saveRecord('candidates', candidate)
  }

  const account = await insertUser({
    name,
    email,
    password,
    role: 'Candidate',
    portal: 'candidate',
    candidateId: candidate.id,
  })
  const token = signToken(account)
  const session = { ...account, token }
  delete session.password
  res.status(201).json({ token, session })
}))

app.post('/api/auth/forgot-password', asyncRoute(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  if (!email) fail(400, 'Email is required.')
  const { rows } = await pool.query(`select id from ${table('users')} where email = $1`, [email])
  if (rows.length) {
    await insertRecord('enquiries', {
      id: nid('enq'),
      type: 'password-reset',
      email,
      userId: rows[0].id,
      createdAt: new Date().toISOString(),
    })
    await notify('admin', 'Password reset requested', email, '/users')
  }
  res.json({ ok: true })
}))

app.get('/api/auth/me', requireUser, asyncRoute(async (req, res) => {
  res.json({ user: req.user })
}))

app.patch('/api/me/settings', requireUser, asyncRoute(async (req, res) => {
  const { rows } = await pool.query(`select payload from ${table('users')} where id = $1`, [req.user.id])
  const payload = rows[0]?.payload || {}
  payload.settings = { ...(payload.settings || {}), ...(req.body || {}) }
  await pool.query(`update ${table('users')} set payload = $2::jsonb where id = $1`, [req.user.id, JSON.stringify(payload)])
  res.json({ settings: payload.settings })
}))

app.get('/api/state', requireUser, asyncRoute(async (req, res) => {
  res.json(await buildState(req.user))
}))

app.get('/api/users', requireUser, asyncRoute(async (req, res) => {
  const includePassword = req.user.role === 'Super Admin'
  const columns = includePassword
    ? 'id, email, role, portal, company_id, candidate_id, status, payload, password_plain'
    : 'id, email, role, portal, company_id, candidate_id, status, payload'
  const { rows } = await pool.query(`select ${columns} from ${table('users')} order by created_at desc`)
  let accounts = rows.map((row) => publicUser(row, includePassword))
  if (req.user.role === 'Super Admin') {
    /* full list */
  } else if (req.user.role === 'Admin') {
    accounts = accounts.filter((item) => item.role === 'Sub Admin').map(({ password, ...rest }) => rest)
  } else {
    accounts = []
  }
  res.json({ accounts })
}))

app.post('/api/users', requireUser, asyncRoute(async (req, res) => {
  const allowed = creatableRoles(req.user)
  if (!allowed.includes(req.body.role)) fail(403, 'You cannot create this type of account.')
  const account = await insertUser({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    portal: 'admin',
  })
  await audit(req.user, 'user.created', 'User', account.id, `Created ${account.role} ${account.email}`)
  if (req.user.role !== 'Super Admin') delete account.password
  res.status(201).json({ account })
}))

app.patch('/api/users/:id', requireUser, asyncRoute(async (req, res) => {
  if (req.user.role !== 'Super Admin') fail(403, 'You cannot change credentials.')
  const password = String(req.body.password || '')
  if (password.length < 8) fail(400, 'Password must be at least 8 characters.')
  const { rows } = await pool.query(`select id, payload from ${table('users')} where id = $1`, [req.params.id])
  if (!rows.length) fail(404, 'Account not found.')
  const hash = await bcrypt.hash(password, 10)
  await pool.query(`update ${table('users')} set password_hash = $2, password_plain = $3 where id = $1`, [req.params.id, hash, password])
  await audit(req.user, 'user.password', 'User', req.params.id, 'Password updated')
  res.json({ ok: true })
}))

app.delete('/api/users/:id', requireUser, asyncRoute(async (req, res) => {
  if (req.user.role !== 'Super Admin') fail(403, 'You cannot delete this account.')
  if (req.user.id === req.params.id) fail(403, 'You cannot delete your own account.')
  const { rows } = await pool.query(`select id, role from ${table('users')} where id = $1`, [req.params.id])
  if (!rows.length) fail(404, 'Account not found.')
  if (rows[0].role === 'Super Admin') {
    const count = await pool.query(`select count(*)::int as total from ${table('users')} where role = 'Super Admin'`)
    if (count.rows[0].total <= 1) fail(403, 'The last super admin cannot be deleted.')
  }
  await pool.query(`delete from ${table('saved_jobs')} where user_id = $1`, [req.params.id])
  await pool.query(`delete from ${table('users')} where id = $1`, [req.params.id])
  await audit(req.user, 'user.deleted', 'User', req.params.id, 'Account deleted')
  res.json({ ok: true })
}))

app.get('/api/companies', requireUser, asyncRoute(async (req, res) => {
  const state = await buildState(req.user)
  res.json(state.companies)
}))

app.post('/api/companies', requireUser, asyncRoute(async (req, res) => {
  requireAgency(req.user)
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  if (!name || !email) fail(400, 'Company name and email are required.')
  const company = {
    id: nid('co'),
    name,
    contactName: req.body.contactName || '',
    email,
    phone: req.body.phone || '',
    industry: req.body.industry || '',
    website: req.body.website || '',
    billingAddress: req.body.billingAddress || '',
    workLocations: Array.isArray(req.body.workLocations) ? req.body.workLocations : [],
    status: req.body.status || 'Active',
    createdAt: today(),
  }
  await insertRecord('companies', company)
  await audit(req.user, 'company.created', 'Company', company.id, `Created company ${company.name}`)
  res.status(201).json(company)
}))

app.get('/api/companies/:id', requireUser, asyncRoute(async (req, res) => {
  const company = await getRecord('companies', req.params.id)
  if (!company) fail(404, 'Company not found.')
  assertCompany(req.user, company.id)
  res.json(company)
}))

app.patch('/api/companies/:id', requireUser, asyncRoute(async (req, res) => {
  const current = await getRecord('companies', req.params.id)
  if (!current) fail(404, 'Company not found.')
  assertCompany(req.user, current.id)
  const next = { ...current, ...req.body, id: current.id }
  await saveRecord('companies', next)
  await audit(req.user, 'company.updated', 'Company', next.id, `Updated company ${next.name}`)
  res.json(next)
}))

app.post('/api/companies/:id/users', requireUser, asyncRoute(async (req, res) => {
  if (!['Super Admin', 'Admin'].includes(req.user.role)) fail(403, 'You cannot provision employer accounts.')
  const company = await getRecord('companies', req.params.id)
  if (!company) fail(404, 'Company not found.')
  const role = req.body.role === 'Hiring Manager' ? 'Hiring Manager' : 'Company Admin'
  const account = await insertUser({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role,
    portal: 'employee',
    companyId: company.id,
  })
  await audit(req.user, 'employer.created', 'User', account.id, `Provisioned ${role} for ${company.name}`)
  delete account.password
  res.status(201).json({ account })
}))

app.get('/api/candidates', requireUser, asyncRoute(async (req, res) => {
  res.json((await buildState(req.user)).candidates)
}))

app.post('/api/candidates', requireUser, asyncRoute(async (req, res) => {
  requireAgency(req.user)
  const fullName = String(req.body.fullName || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  if (!fullName || !email) fail(400, 'Candidate name and email are required.')
  const candidate = {
    id: nid('cand'),
    fullName,
    email,
    phone: req.body.phone || '',
    city: req.body.city || '',
    country: req.body.country || '',
    headline: req.body.headline || '',
    bio: req.body.bio || '',
    skills: req.body.skills || [],
    experience: req.body.experience || [],
    education: req.body.education || [],
    preferences: req.body.preferences || {},
    availability: req.body.availability || '',
    status: req.body.status || 'Active',
    visibility: req.body.visibility || 'Visible to recruiters',
    cvMeta: req.body.cvMeta || null,
  }
  await insertRecord('candidates', candidate)
  await audit(req.user, 'candidate.created', 'Candidate', candidate.id, `Created candidate ${candidate.fullName}`)
  res.status(201).json(candidate)
}))

app.get('/api/candidates/:id', requireUser, asyncRoute(async (req, res) => {
  const candidate = await getRecord('candidates', req.params.id)
  if (!candidate) fail(404, 'Candidate not found.')
  if (isCandidate(req.user) && req.user.candidateId !== candidate.id) fail(403, 'You cannot view this candidate.')
  res.json(candidate)
}))

app.patch('/api/candidates/:id', requireUser, asyncRoute(async (req, res) => {
  const current = await getRecord('candidates', req.params.id)
  if (!current) fail(404, 'Candidate not found.')
  if (isCandidate(req.user) && req.user.candidateId !== current.id) fail(403, 'You cannot edit this profile.')
  if (isEmployer(req.user)) {
    const state = await buildState(req.user)
    if (!state.candidates.some((item) => item.id === current.id)) fail(403, 'You cannot edit this profile.')
  }
  const next = { ...current, ...req.body, id: current.id, email: req.body.email ? String(req.body.email).trim().toLowerCase() : current.email }
  await saveRecord('candidates', next)
  await audit(req.user, 'candidate.updated', 'Candidate', next.id, `Updated candidate ${next.fullName}`)
  res.json(next)
}))

app.get('/api/staffing-requests', requireUser, asyncRoute(async (req, res) => {
  res.json((await buildState(req.user)).staffingRequests)
}))

app.post('/api/staffing-requests', requireUser, asyncRoute(async (req, res) => {
  const companyId = isEmployer(req.user) ? req.user.companyId : req.body.companyId
  if (!companyId) fail(400, 'A company is required.')
  assertCompany(req.user, companyId)
  const item = {
    id: nid('sr'),
    companyId,
    title: req.body.title || '',
    role: req.body.role || '',
    department: req.body.department || '',
    headcount: Number(req.body.headcount || 1),
    employmentType: req.body.employmentType || '',
    skills: req.body.skills || [],
    qualifications: req.body.qualifications || '',
    experience: req.body.experience || '',
    location: req.body.location || '',
    startDate: req.body.startDate || '',
    duration: req.body.duration || '',
    hours: req.body.hours || '',
    payRange: req.body.payRange || '',
    description: req.body.description || '',
    additional: req.body.additional || '',
    priority: req.body.priority || 'Medium',
    status: req.body.status || 'Draft',
    recruiterId: req.body.recruiterId || null,
    createdAt: today(),
    updatedAt: today(),
  }
  if (!item.title || !item.role) fail(400, 'Title and role are required.')
  await insertRecord('staffing_requests', item)
  await audit(req.user, 'staffingRequest.created', 'StaffingRequest', item.id, `Created staffing request ${item.title}`)
  if (item.status !== 'Draft') await notify('admin', 'New staffing request', item.title, `/staffing-requests/${item.id}`)
  res.status(201).json(item)
}))

app.get('/api/staffing-requests/:id', requireUser, asyncRoute(async (req, res) => {
  const item = await getRecord('staffing_requests', req.params.id)
  if (!item) fail(404, 'Staffing request not found.')
  assertCompany(req.user, item.companyId)
  res.json(item)
}))

app.patch('/api/staffing-requests/:id', requireUser, asyncRoute(async (req, res) => {
  const current = await getRecord('staffing_requests', req.params.id)
  if (!current) fail(404, 'Staffing request not found.')
  assertCompany(req.user, current.companyId)
  const next = { ...current, ...req.body, id: current.id, companyId: current.companyId, updatedAt: today() }
  await saveRecord('staffing_requests', next)
  await audit(req.user, 'staffingRequest.updated', 'StaffingRequest', next.id, `Updated request ${next.title}`)
  res.json(next)
}))

app.get('/api/jobs', requireUser, asyncRoute(async (req, res) => {
  res.json((await buildState(req.user)).jobs)
}))

app.post('/api/jobs', requireUser, asyncRoute(async (req, res) => {
  requireAgency(req.user)
  const company = await getRecord('companies', req.body.companyId)
  if (!company) fail(400, 'Choose a company that exists.')
  if (!req.body.title || !req.body.location) fail(400, 'Title and location are required.')
  const description = req.body.description || ''
  const job = {
    id: nid('job'),
    title: req.body.title,
    companyId: company.id,
    staffingRequestId: req.body.staffingRequestId || null,
    location: req.body.location,
    employmentType: req.body.employmentType || 'Temporary',
    category: req.body.category || '',
    department: req.body.department || '',
    skills: req.body.skills || [],
    description,
    summary: req.body.summary || description.slice(0, 180),
    responsibilities: req.body.responsibilities || [],
    requirements: req.body.requirements || [],
    status: req.body.status || 'Draft',
    salaryLabel: req.body.salaryLabel || '',
    isSample: false,
    postedAt: today(),
    experienceLevel: req.body.experienceLevel || '',
  }
  await insertRecord('jobs', job)
  await audit(req.user, 'job.created', 'Job', job.id, `Created job ${job.title}`)
  res.status(201).json(job)
}))

app.get('/api/jobs/:id', requireUser, asyncRoute(async (req, res) => {
  const job = await getRecord('jobs', req.params.id)
  if (!job) fail(404, 'Job not found.')
  if (isCandidate(req.user) && job.status !== 'Published') fail(404, 'Job not found.')
  if (isEmployer(req.user)) assertCompany(req.user, job.companyId)
  res.json(job)
}))

app.patch('/api/jobs/:id', requireUser, asyncRoute(async (req, res) => {
  requireAgency(req.user)
  const current = await getRecord('jobs', req.params.id)
  if (!current) fail(404, 'Job not found.')
  const next = { ...current, ...req.body, id: current.id, isSample: false }
  if (next.description && !req.body.summary) next.summary = String(next.description).slice(0, 180)
  await saveRecord('jobs', next)
  await audit(req.user, 'job.updated', 'Job', next.id, `Updated job ${next.title}`)
  res.json(next)
}))

app.get('/api/public/jobs', asyncRoute(async (_req, res) => {
  const jobs = (await listRecords('jobs')).filter((job) => job.status === 'Published')
  const companies = await listRecords('companies')
  const names = new Map(companies.map((company) => [company.id, company.name]))
  res.json(jobs.map((job) => ({ ...job, companyName: names.get(job.companyId) || '' })))
}))

app.get('/api/public/jobs/:id', asyncRoute(async (req, res) => {
  const job = await getRecord('jobs', req.params.id)
  if (!job || job.status !== 'Published') fail(404, 'Job not found.')
  const company = job.companyId ? await getRecord('companies', job.companyId) : null
  res.json({ ...job, companyName: company?.name || '' })
}))

app.post('/api/public/contact', asyncRoute(async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const message = String(req.body.message || '').trim()
  if (!name || !email || !message) fail(400, 'Name, email, and message are required.')
  const enquiry = {
    id: nid('enq'),
    type: 'contact',
    name,
    email,
    phone: req.body.phone || '',
    enquiryType: req.body.enquiryType || '',
    subject: req.body.subject || '',
    message,
    createdAt: new Date().toISOString(),
  }
  await insertRecord('enquiries', enquiry)
  await notify('admin', 'New contact enquiry', enquiry.subject || enquiry.name, '/notifications')
  res.status(201).json({ ok: true, id: enquiry.id })
}))

app.post('/api/public/staffing-requests', asyncRoute(async (req, res) => {
  const companyName = String(req.body.companyName || '').trim()
  const contactName = String(req.body.contactName || '').trim()
  const email = String(req.body.businessEmail || '').trim().toLowerCase()
  const jobRoles = String(req.body.jobRoles || '').trim()
  const location = String(req.body.location || '').trim()
  if (!companyName || !contactName || !email || !jobRoles || !location) {
    fail(400, 'Company, contact, email, roles, and location are required.')
  }
  const companies = await listRecords('companies')
  let company = companies.find((item) => String(item.email || '').toLowerCase() === email)
  if (!company) {
    company = {
      id: nid('co'),
      name: companyName,
      contactName,
      email,
      phone: req.body.phone || '',
      industry: req.body.industry || '',
      website: req.body.website || '',
      billingAddress: '',
      workLocations: location ? [location] : [],
      status: 'Active',
      createdAt: today(),
    }
    await insertRecord('companies', company)
  }
  const request = {
    id: nid('sr'),
    companyId: company.id,
    title: jobRoles,
    role: jobRoles,
    department: '',
    headcount: Number(req.body.headcount || 1),
    employmentType: req.body.employmentType || '',
    skills: String(req.body.skills || '').split(',').map((item) => item.trim()).filter(Boolean),
    qualifications: req.body.qualifications || '',
    experience: req.body.experience || '',
    location,
    startDate: req.body.startDate || '',
    duration: req.body.duration || '',
    hours: req.body.hours || '',
    payRange: req.body.payRange || '',
    description: jobRoles,
    additional: req.body.additional || '',
    priority: 'Medium',
    status: 'Submitted',
    recruiterId: null,
    createdAt: today(),
    updatedAt: today(),
  }
  await insertRecord('staffing_requests', request)
  await insertRecord('enquiries', {
    id: nid('enq'),
    type: 'staffing',
    companyId: company.id,
    staffingRequestId: request.id,
    email,
    createdAt: new Date().toISOString(),
  })
  await notify('admin', 'Staffing request submitted', `${company.name}: ${request.title}`, `/staffing-requests/${request.id}`)
  await notify(`employer:${company.id}`, 'We received your staffing request', request.title, `/staffing-requests/${request.id}`)
  res.status(201).json({ ok: true, companyId: company.id, staffingRequestId: request.id })
}))

app.post('/api/public/candidate-interest', asyncRoute(async (req, res) => {
  const fullName = String(req.body.fullName || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  if (!fullName || !email) fail(400, 'Name and email are required.')
  const candidates = await listRecords('candidates')
  let candidate = candidates.find((item) => String(item.email || '').toLowerCase() === email)
  const skills = String(req.body.skills || '').split(',').map((item) => item.trim()).filter(Boolean)
  const cvMeta = req.body.cvFileName
    ? { fileName: req.body.cvFileName, sizeLabel: req.body.cvSizeLabel || '', updatedAt: today() }
    : null
  if (!candidate) {
    candidate = {
      id: nid('cand'),
      fullName,
      email,
      phone: req.body.phone || '',
      city: req.body.preferredLocation || '',
      country: '',
      headline: req.body.preferredRole || '',
      bio: req.body.introduction || '',
      skills,
      experience: req.body.experience ? [{ title: req.body.experience }] : [],
      education: req.body.qualifications ? [{ qualification: req.body.qualifications }] : [],
      preferences: {
        desiredRole: req.body.preferredRole || '',
        locations: req.body.preferredLocation ? [req.body.preferredLocation] : [],
        employmentTypes: req.body.employmentType ? [req.body.employmentType] : [],
        salaryExpectation: '',
        availabilityDate: '',
        relocation: false,
        workMode: '',
      },
      availability: '',
      status: 'Interest',
      visibility: 'Visible to recruiters',
      cvMeta,
    }
    await insertRecord('candidates', candidate)
  } else {
    candidate = {
      ...candidate,
      fullName: candidate.fullName || fullName,
      phone: candidate.phone || req.body.phone || '',
      skills: candidate.skills?.length ? candidate.skills : skills,
      cvMeta: cvMeta || candidate.cvMeta,
    }
    await saveRecord('candidates', candidate)
  }
  await insertRecord('enquiries', {
    id: nid('enq'),
    type: 'candidate-interest',
    candidateId: candidate.id,
    email,
    createdAt: new Date().toISOString(),
  })
  await notify('admin', 'Candidate interest', `${fullName} · ${req.body.preferredRole || 'role not specified'}`, `/candidates/${candidate.id}`)
  res.status(201).json({ ok: true, candidateId: candidate.id })
}))

app.get('/api/applications', requireUser, asyncRoute(async (req, res) => {
  res.json((await buildState(req.user)).applications)
}))

app.post('/api/applications', requireUser, asyncRoute(async (req, res) => {
  const candidateId = isCandidate(req.user) ? req.user.candidateId : req.body.candidateId
  const job = await getRecord('jobs', req.body.jobId)
  if (!job) fail(404, 'Job not found.')
  if (isCandidate(req.user) && job.status !== 'Published') fail(400, 'This job is not open for applications.')
  if (isEmployer(req.user)) assertCompany(req.user, job.companyId)
  const existing = (await listRecords('applications')).find((item) => item.candidateId === candidateId && item.jobId === job.id && item.status !== 'Withdrawn')
  if (existing) fail(409, 'You already have an active application for this job.')
  const item = {
    id: nid('app'),
    candidateId,
    jobId: job.id,
    status: req.body.status || 'Submitted',
    coverLetter: req.body.coverLetter || '',
    availability: req.body.availability || '',
    experienceSummary: req.body.experienceSummary || '',
    additional: req.body.additional || '',
    appliedAt: today(),
    updatedAt: today(),
    timeline: [{ status: 'Submitted', at: today(), note: 'Application submitted' }],
  }
  await insertRecord('applications', item)
  await audit(req.user, 'application.created', 'Application', item.id, `Application for ${job.title}`)
  await notify('admin', 'New application', job.title, `/recruitment`)
  res.status(201).json(item)
}))

app.patch('/api/applications/:id', requireUser, asyncRoute(async (req, res) => {
  const current = await getRecord('applications', req.params.id)
  if (!current) fail(404, 'Application not found.')
  if (isCandidate(req.user)) {
    if (req.user.candidateId !== current.candidateId) fail(403, 'You cannot update this application.')
    if (req.body.status && req.body.status !== 'Withdrawn') fail(403, 'You can withdraw your application.')
  }
  if (isEmployer(req.user)) {
    const job = await getRecord('jobs', current.jobId)
    assertCompany(req.user, job?.companyId)
  }
  const timeline = req.body.status && req.body.status !== current.status
    ? [...(current.timeline || []), { status: req.body.status, at: today(), note: req.body.note || 'Status updated' }]
    : current.timeline
  const next = { ...current, ...req.body, id: current.id, candidateId: current.candidateId, jobId: current.jobId, timeline, updatedAt: today() }
  await saveRecord('applications', next)
  await audit(req.user, 'application.updated', 'Application', next.id, `Application ${next.status}`)
  res.json(next)
}))

app.get('/api/interviews', requireUser, asyncRoute(async (req, res) => {
  res.json((await buildState(req.user)).interviews)
}))

app.post('/api/interviews', requireUser, asyncRoute(async (req, res) => {
  if (isCandidate(req.user)) fail(403, 'Candidates cannot schedule interviews.')
  const companyId = req.body.companyId
  assertCompany(req.user, companyId)
  const item = {
    id: nid('int'),
    candidateId: req.body.candidateId,
    jobId: req.body.jobId,
    companyId,
    datetime: req.body.datetime,
    timezone: req.body.timezone || 'Europe/London',
    type: req.body.type || 'Video',
    interviewer: req.body.interviewer || '',
    locationOrLink: req.body.locationOrLink || '',
    status: req.body.status || 'Scheduled',
    feedback: req.body.feedback || '',
  }
  if (!item.candidateId || !item.datetime) fail(400, 'Candidate and date are required.')
  await insertRecord('interviews', item)
  await audit(req.user, 'interview.scheduled', 'Interview', item.id, 'Interview scheduled')
  await notify(`candidate:${item.candidateId}`, 'Interview scheduled', item.type, '/interviews')
  res.status(201).json(item)
}))

app.patch('/api/interviews/:id', requireUser, asyncRoute(async (req, res) => {
  const current = await getRecord('interviews', req.params.id)
  if (!current) fail(404, 'Interview not found.')
  if (isCandidate(req.user) && req.user.candidateId !== current.candidateId) fail(403, 'You cannot update this interview.')
  if (!isCandidate(req.user)) assertCompany(req.user, current.companyId)
  const next = { ...current, ...req.body, id: current.id }
  await saveRecord('interviews', next)
  await audit(req.user, 'interview.updated', 'Interview', next.id, `Interview ${next.status}`)
  res.json(next)
}))

app.get('/api/placements', requireUser, asyncRoute(async (req, res) => {
  res.json((await buildState(req.user)).placements)
}))

app.post('/api/placements', requireUser, asyncRoute(async (req, res) => {
  if (!isAgency(req.user)) fail(403, 'Only agency staff can create placements.')
  const candidate = await getRecord('candidates', req.body.candidateId)
  if (!candidate) fail(400, 'Candidate not found.')
  const company = await getRecord('companies', req.body.companyId)
  if (!company) fail(400, 'Company not found.')
  const placementId = nid('pl')
  const workerId = nid('wk')
  const placement = {
    id: placementId,
    candidateId: candidate.id,
    workerId,
    companyId: company.id,
    staffingRequestId: req.body.staffingRequestId || null,
    jobId: req.body.jobId || null,
    role: req.body.role || '',
    department: req.body.department || '',
    location: req.body.location || '',
    employmentType: req.body.employmentType || '',
    startDate: req.body.startDate || today(),
    endDate: req.body.endDate || null,
    rate: Number(req.body.rate || 0),
    rateUnit: req.body.rateUnit || 'hour',
    status: req.body.status || 'Confirmed',
    recruiterId: req.user.id,
    contractRef: `CTR-${Math.floor(100000 + Math.random() * 900000)}`,
    pattern: req.body.pattern || 'Standard',
  }
  const worker = {
    id: workerId,
    placementId,
    candidateId: candidate.id,
    companyId: company.id,
    displayName: candidate.fullName,
    role: placement.role,
    department: placement.department,
    location: placement.location,
    employmentType: placement.employmentType,
    pattern: placement.pattern,
    status: 'Assigned',
    startDate: placement.startDate,
    endDate: placement.endDate,
  }
  await insertRecord('placements', placement)
  await insertRecord('workers', worker)
  await audit(req.user, 'placement.created', 'Placement', placement.id, `Placed ${candidate.fullName}`)
  await notify(`employer:${company.id}`, 'Placement confirmed', placement.role, `/placements/${placement.id}`)
  await notify(`candidate:${candidate.id}`, 'You have been placed', placement.role, '/applications')
  res.status(201).json({ placement, worker })
}))

app.get('/api/workers', requireUser, asyncRoute(async (req, res) => {
  res.json((await buildState(req.user)).workers)
}))

app.get('/api/workers/:id', requireUser, asyncRoute(async (req, res) => {
  const worker = await getRecord('workers', req.params.id)
  if (!worker) fail(404, 'Worker not found.')
  assertCompany(req.user, worker.companyId)
  res.json(worker)
}))

app.patch('/api/workers/:id', requireUser, asyncRoute(async (req, res) => {
  const current = await getRecord('workers', req.params.id)
  if (!current) fail(404, 'Worker not found.')
  assertCompany(req.user, current.companyId)
  const next = { ...current, ...req.body, id: current.id, companyId: current.companyId }
  await saveRecord('workers', next)
  res.json(next)
}))

app.get('/api/timesheets', requireUser, asyncRoute(async (req, res) => {
  res.json((await buildState(req.user)).timesheets)
}))

app.post('/api/timesheets', requireUser, asyncRoute(async (req, res) => {
  const worker = await getRecord('workers', req.body.workerId)
  if (!worker) fail(400, 'Worker not found.')
  assertCompany(req.user, worker.companyId)
  const regularHours = Number(req.body.regularHours || 0)
  const overtimeHours = Number(req.body.overtimeHours || 0)
  const breakHours = Number(req.body.breakHours || 0)
  const item = {
    id: nid('ts'),
    workerId: worker.id,
    companyId: worker.companyId,
    weekEnding: req.body.weekEnding || today(),
    regularHours,
    overtimeHours,
    breakHours,
    totalHours: Math.max(0, regularHours + overtimeHours - breakHours),
    status: req.body.status || 'Draft',
    submittedAt: req.body.status === 'Submitted' ? new Date().toISOString() : null,
    reviewedAt: null,
    rejectionReason: '',
  }
  await insertRecord('timesheets', item)
  await audit(req.user, 'timesheet.created', 'Timesheet', item.id, `Timesheet for ${worker.displayName}`)
  res.status(201).json(item)
}))

app.patch('/api/timesheets/:id', requireUser, asyncRoute(async (req, res) => {
  const current = await getRecord('timesheets', req.params.id)
  if (!current) fail(404, 'Timesheet not found.')
  assertCompany(req.user, current.companyId)
  const regularHours = Number(req.body.regularHours ?? current.regularHours ?? 0)
  const overtimeHours = Number(req.body.overtimeHours ?? current.overtimeHours ?? 0)
  const breakHours = Number(req.body.breakHours ?? current.breakHours ?? 0)
  const next = {
    ...current,
    ...req.body,
    id: current.id,
    workerId: current.workerId,
    companyId: current.companyId,
    regularHours,
    overtimeHours,
    breakHours,
    totalHours: Math.max(0, regularHours + overtimeHours - breakHours),
  }
  if (next.status === 'Submitted' && !current.submittedAt) next.submittedAt = new Date().toISOString()
  if (['Approved', 'Rejected'].includes(next.status)) next.reviewedAt = next.reviewedAt || new Date().toISOString()
  await saveRecord('timesheets', next)
  await audit(req.user, 'timesheet.updated', 'Timesheet', next.id, `Timesheet ${next.status}`)
  res.json(next)
}))

app.get('/api/documents', requireUser, asyncRoute(async (req, res) => {
  res.json((await buildState(req.user)).documents)
}))

app.post('/api/documents', requireUser, asyncRoute(async (req, res) => {
  if (isCandidate(req.user) && req.body.candidateId && req.body.candidateId !== req.user.candidateId) {
    fail(403, 'You cannot add a document for another candidate.')
  }
  if (req.body.companyId) assertCompany(req.user, req.body.companyId)
  const item = {
    id: nid('doc'),
    title: req.body.title || 'Document',
    category: req.body.category || 'General',
    companyId: req.body.companyId || null,
    candidateId: isCandidate(req.user) ? req.user.candidateId : (req.body.candidateId || null),
    workerId: req.body.workerId || null,
    placementId: req.body.placementId || null,
    issuedAt: req.body.issuedAt || today(),
    expiresAt: req.body.expiresAt || null,
    status: req.body.status || 'Active',
    fileName: req.body.fileName || null,
  }
  await insertRecord('documents', item)
  await audit(req.user, 'document.created', 'Document', item.id, item.title)
  res.status(201).json(item)
}))

app.patch('/api/documents/:id', requireUser, asyncRoute(async (req, res) => {
  const current = await getRecord('documents', req.params.id)
  if (!current) fail(404, 'Document not found.')
  if (isCandidate(req.user) && current.candidateId !== req.user.candidateId) fail(403, 'You cannot edit this document.')
  if (current.companyId && !isCandidate(req.user)) assertCompany(req.user, current.companyId)
  const next = { ...current, ...req.body, id: current.id }
  await saveRecord('documents', next)
  res.json(next)
}))

app.get('/api/payroll-periods', requireUser, asyncRoute(async (req, res) => {
  requireAgency(req.user)
  res.json(await listRecords('payroll_periods'))
}))

app.post('/api/payroll-periods', requireUser, asyncRoute(async (req, res) => {
  requireAgency(req.user)
  const item = {
    id: nid('pp'),
    label: req.body.label || 'Payroll period',
    startDate: req.body.startDate || today(),
    endDate: req.body.endDate || today(),
    status: req.body.status || 'Open',
  }
  await insertRecord('payroll_periods', item)
  await audit(req.user, 'payrollPeriod.created', 'PayrollPeriod', item.id, item.label)
  res.status(201).json(item)
}))

app.patch('/api/payroll-periods/:id', requireUser, asyncRoute(async (req, res) => {
  requireAgency(req.user)
  const current = await getRecord('payroll_periods', req.params.id)
  if (!current) fail(404, 'Payroll period not found.')
  const next = { ...current, ...req.body, id: current.id }
  await saveRecord('payroll_periods', next)
  res.json(next)
}))

app.get('/api/payroll-entries', requireUser, asyncRoute(async (req, res) => {
  res.json((await buildState(req.user)).payrollEntries)
}))

app.post('/api/payroll-entries', requireUser, asyncRoute(async (req, res) => {
  requireAgency(req.user)
  const worker = await getRecord('workers', req.body.workerId)
  if (!worker) fail(400, 'Worker not found.')
  const regularHours = Number(req.body.regularHours || 0)
  const overtimeHours = Number(req.body.overtimeHours || 0)
  const hourlyRate = Number(req.body.hourlyRate || 0)
  const gross = Number(req.body.gross ?? (regularHours + overtimeHours) * hourlyRate)
  const deductions = Number(req.body.deductions || 0)
  const employerCost = Number(req.body.employerCost ?? gross * 0.15)
  const item = {
    id: nid('pe'),
    periodId: req.body.periodId,
    workerId: worker.id,
    companyId: worker.companyId,
    timesheetIds: req.body.timesheetIds || [],
    regularHours,
    overtimeHours,
    hourlyRate,
    gross: Number(gross.toFixed(2)),
    deductions,
    employerCost: Number(employerCost.toFixed(2)),
    net: Number((gross - deductions).toFixed(2)),
    status: req.body.status || 'Pending Review',
    notes: req.body.notes || '',
  }
  if (!item.periodId) fail(400, 'A payroll period is required.')
  await insertRecord('payroll_entries', item)
  await audit(req.user, 'payrollEntry.created', 'PayrollEntry', item.id, `Payroll entry for ${worker.displayName}`)
  res.status(201).json(item)
}))

app.patch('/api/payroll-entries/:id', requireUser, asyncRoute(async (req, res) => {
  requireAgency(req.user)
  const current = await getRecord('payroll_entries', req.params.id)
  if (!current) fail(404, 'Payroll entry not found.')
  const next = { ...current, ...req.body, id: current.id, workerId: current.workerId, companyId: current.companyId }
  await saveRecord('payroll_entries', next)
  await audit(req.user, 'payrollEntry.updated', 'PayrollEntry', next.id, `Payroll entry ${next.status}`)
  res.json(next)
}))

app.get('/api/invoices', requireUser, asyncRoute(async (req, res) => {
  res.json((await buildState(req.user)).invoices)
}))

app.post('/api/invoices', requireUser, asyncRoute(async (req, res) => {
  requireAgency(req.user)
  const company = await getRecord('companies', req.body.companyId)
  if (!company) fail(400, 'Choose a company that exists.')
  const draft = {
    id: nid('inv'),
    number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    companyId: company.id,
    issueDate: req.body.issueDate || today(),
    dueDate: req.body.dueDate || '',
    lineItems: req.body.lineItems || [],
    taxRate: Number(req.body.taxRate ?? 0.2),
    status: req.body.status || 'Draft',
    engagementLabel: req.body.engagementLabel || '',
  }
  const item = { ...draft, ...invoiceTotals(draft) }
  await insertRecord('invoices', item)
  await audit(req.user, 'invoice.created', 'Invoice', item.id, `Invoice ${item.number}`)
  await notify(`employer:${company.id}`, 'New invoice', item.number, `/invoices/${item.id}`)
  res.status(201).json(item)
}))

app.get('/api/invoices/:id', requireUser, asyncRoute(async (req, res) => {
  const invoice = await getRecord('invoices', req.params.id)
  if (!invoice) fail(404, 'Invoice not found.')
  assertCompany(req.user, invoice.companyId)
  res.json(invoice)
}))

app.patch('/api/invoices/:id', requireUser, asyncRoute(async (req, res) => {
  const current = await getRecord('invoices', req.params.id)
  if (!current) fail(404, 'Invoice not found.')
  if (isEmployer(req.user)) fail(403, 'Invoices are updated by the agency.')
  requireAgency(req.user)
  const merged = { ...current, ...req.body, id: current.id, companyId: current.companyId, number: current.number }
  const next = { ...merged, ...invoiceTotals(merged) }
  await saveRecord('invoices', next)
  await audit(req.user, 'invoice.updated', 'Invoice', next.id, `Invoice ${next.number} ${next.status}`)
  res.json(next)
}))

app.get('/api/notifications', requireUser, asyncRoute(async (req, res) => {
  res.json((await buildState(req.user)).notifications)
}))

app.patch('/api/notifications/:id', requireUser, asyncRoute(async (req, res) => {
  const current = await getRecord('notifications', req.params.id)
  if (!current) fail(404, 'Notification not found.')
  if (!canSeeNotification(req.user, current)) fail(403, 'You cannot update this notification.')
  const next = { ...current, read: true }
  await saveRecord('notifications', next)
  res.json(next)
}))

app.post('/api/notifications/read', requireUser, asyncRoute(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : []
  const updated = []
  for (const noteId of ids) {
    const current = await getRecord('notifications', noteId)
    if (current && canSeeNotification(req.user, current)) {
      const next = { ...current, read: true }
      await saveRecord('notifications', next)
      updated.push(next)
    }
  }
  res.json({ notifications: updated })
}))

app.get('/api/audit-events', requireUser, asyncRoute(async (req, res) => {
  requireAgency(req.user)
  res.json(await listRecords('audit_events'))
}))

app.get('/api/enquiries', requireUser, asyncRoute(async (req, res) => {
  requireAgency(req.user)
  res.json(await listRecords('enquiries'))
}))

app.post('/api/saved-jobs/toggle', requireUser, asyncRoute(async (req, res) => {
  if (!isCandidate(req.user)) fail(403, 'Only candidates can save jobs.')
  const job = await getRecord('jobs', req.body.jobId)
  if (!job || job.status !== 'Published') fail(404, 'Job not found.')
  const existing = await pool.query(`select id from ${table('saved_jobs')} where user_id = $1 and job_id = $2`, [req.user.id, job.id])
  if (existing.rows.length) {
    await pool.query(`delete from ${table('saved_jobs')} where id = $1`, [existing.rows[0].id])
  } else {
    await pool.query(`insert into ${table('saved_jobs')} (id, user_id, job_id) values ($1,$2,$3)`, [nid('sav'), req.user.id, job.id])
  }
  const saved = await pool.query(`select job_id from ${table('saved_jobs')} where user_id = $1`, [req.user.id])
  res.json({ savedJobIds: saved.rows.map((row) => row.job_id) })
}))

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

ensureSchema()
  .then(() => {
    const port = Number(process.env.PORT || 5080)
    app.listen(port, () => {
      console.log(`Staffora API listening on ${port}`)
    })
  })
  .catch((error) => {
    console.error('Could not start API', error)
    process.exit(1)
  })
