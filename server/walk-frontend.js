require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const { chromium } = require('playwright')
const { Client } = require('pg')

const apiBase = `http://localhost:${process.env.PORT || 5080}`
const stamp = Date.now().toString(36)
const ids = new Set()
const startedAt = new Date()
const problems = []

function collect(value) {
  if (!value || typeof value !== 'object') return
  if (typeof value.id === 'string') ids.add(value.id)
  if (typeof value.candidateId === 'string') ids.add(value.candidateId)
  if (typeof value.companyId === 'string') ids.add(value.companyId)
  if (typeof value.staffingRequestId === 'string') ids.add(value.staffingRequestId)
  for (const item of Object.values(value)) {
    if (Array.isArray(item)) item.forEach(collect)
    else if (item && typeof item === 'object') collect(item)
  }
}

async function api(path, options = {}, token) {
  const headers = {}
  if (options.body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${apiBase}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`${options.name || path} ${response.status} ${data.error || ''}`)
  collect(data)
  return data
}

async function cleanup() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 6543),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  const prefix = 'recruitment_staffing_platform_'
  const list = [...ids]
  const tables = ['saved_jobs', 'applications', 'interviews', 'timesheets', 'payroll_entries', 'documents', 'invoices', 'placements', 'workers', 'jobs', 'staffing_requests', 'enquiries', 'notifications', 'audit_events', 'candidates', 'companies']
  for (const name of tables) {
    if (name === 'saved_jobs') {
      if (list.length) await client.query(`delete from ${prefix}${name} where user_id = any($1::text[]) or job_id = any($1::text[])`, [list])
    } else if (list.length) {
      await client.query(`delete from ${prefix}${name} where id = any($1::text[])`, [list])
    }
    if (name === 'notifications' || name === 'audit_events' || name === 'enquiries') {
      await client.query(`delete from ${prefix}${name} where created_at >= $1`, [startedAt])
    }
  }
  await client.query(`delete from ${prefix}users where email like $1`, ['walk-%'])
  await client.end()
}

async function openPortal(browser, origin, session) {
  const context = await browser.newContext()
  const page = await context.newPage()
  const pageErrors = []
  const apiErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('response', (response) => {
    const url = response.url()
    if (url.includes(':5080/api/') && response.status() >= 400) apiErrors.push(`${response.status()} ${url}`)
  })
  const hash = encodeURIComponent(JSON.stringify(session))
  await page.goto(`${origin}/dashboard#staffora=${hash}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForFunction(() => !document.body.innerText.includes('Loading records'), null, { timeout: 20000 })
  return { context, page, pageErrors, apiErrors }
}

async function visit(page, origin, route, pageErrors, apiErrors) {
  const beforePage = pageErrors.length
  const beforeApi = apiErrors.length
  await page.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForFunction(() => !document.body.innerText.includes('Loading records'), null, { timeout: 20000 })
  await page.waitForTimeout(400)
  const text = await page.locator('body').innerText()
  const overlay = await page.locator('vite-error-overlay').count()
  const freshPage = pageErrors.slice(beforePage)
  const freshApi = apiErrors.slice(beforeApi)
  const crashed = overlay || /useData requires|is not defined|Cannot read properties/.test(text)
  if (crashed || freshPage.length || freshApi.length) {
    problems.push(`${origin}${route} :: ${[...freshPage, ...freshApi, crashed ? text.slice(0, 180) : ''].filter(Boolean).join(' | ')}`)
    console.log(`FAIL ${origin}${route}`)
  } else {
    console.log(`OK   ${origin}${route}`)
  }
}

async function main() {
  const adminLogin = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: process.env.BOOTSTRAP_ADMIN_EMAIL, password: process.env.BOOTSTRAP_ADMIN_PASSWORD }),
  })
  const adminToken = adminLogin.token
  const company = await api('/api/companies', {
    method: 'POST',
    name: 'create company',
    body: JSON.stringify({ name: `Walk Co ${stamp}`, contactName: 'Walk Contact', email: `walk-co-${stamp}@staffora.test`, industry: 'Logistics' }),
  }, adminToken)
  const employer = await api(`/api/companies/${company.id}/users`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Walk Employer', email: `walk-employer-${stamp}@staffora.test`, password: 'EmployerPass1', role: 'Company Admin' }),
  }, adminToken)
  if (employer.account?.id) ids.add(employer.account.id)
  const request = await api('/api/staffing-requests', {
    method: 'POST',
    body: JSON.stringify({ companyId: company.id, title: 'Walk night shift', role: 'Operative', headcount: 2, location: 'Birmingham', employmentType: 'Temporary', status: 'Submitted', skills: ['picking'] }),
  }, adminToken)
  const job = await api('/api/jobs', {
    method: 'POST',
    body: JSON.stringify({ title: `Walk Warehouse ${stamp}`, companyId: company.id, staffingRequestId: request.id, location: 'Birmingham', employmentType: 'Temporary', category: 'Logistics', description: 'Pick and pack.', responsibilities: ['Pick'], requirements: ['Right to work'], status: 'Published', salaryLabel: 'Hourly' }),
  }, adminToken)
  const registered = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Walk Candidate', email: `walk-candidate-${stamp}@staffora.test`, password: 'Candidate123' }),
  })
  if (registered.session?.id) ids.add(registered.session.id)
  if (registered.session?.candidateId) ids.add(registered.session.candidateId)
  const application = await api('/api/applications', {
    method: 'POST',
    body: JSON.stringify({ jobId: job.id, coverLetter: 'Ready to start.', availability: 'Immediate' }),
  }, registered.token)
  const interview = await api('/api/interviews', {
    method: 'POST',
    body: JSON.stringify({ candidateId: registered.session.candidateId, jobId: job.id, companyId: company.id, datetime: new Date().toISOString(), interviewer: 'Walk Recruiter', type: 'Video' }),
  }, adminToken)
  const placed = await api('/api/placements', {
    method: 'POST',
    body: JSON.stringify({ candidateId: registered.session.candidateId, companyId: company.id, jobId: job.id, staffingRequestId: request.id, role: 'Warehouse Operative', location: 'Birmingham', employmentType: 'Temporary', startDate: '2026-10-20', rate: 13, rateUnit: 'hour' }),
  }, adminToken)
  if (placed.worker?.id) ids.add(placed.worker.id)
  if (placed.placement?.id) ids.add(placed.placement.id)
  const timesheet = await api('/api/timesheets', {
    method: 'POST',
    body: JSON.stringify({ workerId: placed.worker.id, weekEnding: '2026-10-18', regularHours: 40, status: 'Submitted' }),
  }, adminToken)
  const period = await api('/api/payroll-periods', {
    method: 'POST',
    body: JSON.stringify({ label: `Walk week ${stamp}`, startDate: '2026-10-12', endDate: '2026-10-18' }),
  }, adminToken)
  await api('/api/payroll-entries', {
    method: 'POST',
    body: JSON.stringify({ periodId: period.id, workerId: placed.worker.id, regularHours: 40, hourlyRate: 13, timesheetIds: [timesheet.id] }),
  }, adminToken)
  const invoice = await api('/api/invoices', {
    method: 'POST',
    body: JSON.stringify({ companyId: company.id, dueDate: '2026-11-01', engagementLabel: 'Walk cover', lineItems: [{ description: 'Hours', quantity: 8, unitRate: 18 }] }),
  }, adminToken)
  await api('/api/documents', {
    method: 'POST',
    body: JSON.stringify({ title: 'Right to work', category: 'Compliance', companyId: company.id, candidateId: registered.session.candidateId, fileName: 'right-to-work.pdf' }),
  }, adminToken)
  const employerLogin = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: `walk-employer-${stamp}@staffora.test`, password: 'EmployerPass1' }),
  })

  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  try {
    const publicPage = await browser.newPage()
    const publicErrors = []
    publicPage.on('pageerror', (error) => publicErrors.push(error.message))
    const publicRoutes = ['/', '/employers', '/candidates', '/jobs', `/jobs/${job.id}`, '/services', '/industries', '/about', '/contact', '/login', '/register', '/privacy', '/cookies', '/terms', '/missing-page']
    for (const route of publicRoutes) {
      const before = publicErrors.length
      await publicPage.goto(`http://localhost:5177${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await publicPage.waitForTimeout(700)
      if (route.startsWith('/jobs/job_')) {
        try {
          await publicPage.getByRole('heading', { name: /Walk Warehouse/ }).waitFor({ timeout: 12000 })
        } catch (error) {
          const late = await publicPage.locator('body').innerText()
          problems.push(`http://localhost:5177${route} :: ${late.slice(0, 240)}`)
          console.log(`FAIL http://localhost:5177${route}`)
          continue
        }
      }
      const overlay = await publicPage.locator('vite-error-overlay').count()
      const text = await publicPage.locator('body').innerText()
      const fresh = publicErrors.slice(before)
      if (overlay || fresh.length) {
        problems.push(`http://localhost:5177${route} :: ${fresh.join(' | ') || text.slice(0, 160)}`)
        console.log(`FAIL http://localhost:5177${route}`)
      } else {
        console.log(`OK   http://localhost:5177${route}`)
      }
    }
    await publicPage.goto('http://localhost:5177/contact', { waitUntil: 'domcontentloaded' })
    await publicPage.locator('#name').fill('Walk Person')
    await publicPage.locator('#email').fill(`walk-contact-${stamp}@staffora.test`)
    await publicPage.locator('#enquiryType').selectOption({ label: 'General' })
    await publicPage.locator('#subject').fill('Walk subject')
    await publicPage.locator('#message').fill('Walk message from the frontend test.')
    await publicPage.locator('#contact-privacy').check()
    await publicPage.getByRole('button', { name: 'Send message' }).click()
    await publicPage.getByText('Message saved').waitFor({ timeout: 10000 })
    console.log('OK   contact form submit')

    const adminRoutes = [
      '/dashboard', '/companies', `/companies/${company.id}`, '/candidates', `/candidates/${registered.session.candidateId}`,
      '/staffing-requests', `/staffing-requests/${request.id}`, '/jobs', '/jobs/new', `/jobs/${job.id}`, `/jobs/${job.id}/edit`,
      '/recruitment', '/interviews', '/placements', `/placements/${placed.placement.id}`, '/workforce', `/workforce/${placed.worker.id}`,
      '/timesheets', `/timesheets/${timesheet.id}`, '/documents', '/payroll', `/payroll/${period.id}`, '/invoices', '/invoices/new',
      `/invoices/${invoice.id}`, '/reports', '/notifications', '/users', '/roles', '/audit-log', '/settings',
    ]
    const admin = await openPortal(browser, 'http://localhost:5184', adminLogin.session)
    for (const route of adminRoutes) await visit(admin.page, 'http://localhost:5184', route, admin.pageErrors, admin.apiErrors)
    await admin.page.goto('http://localhost:5184/login', { waitUntil: 'domcontentloaded' })
    await admin.page.waitForURL('http://localhost:5177/login', { timeout: 10000 })
    console.log('OK   admin login redirect')
    await admin.context.close()

    const employerRoutes = [
      '/dashboard', '/staffing-requests', '/staffing-requests/new', `/staffing-requests/${request.id}`, `/staffing-requests/${request.id}/edit`,
      '/candidates', `/candidates/${registered.session.candidateId}`, '/placements', `/placements/${placed.placement.id}`,
      '/workforce', `/workforce/${placed.worker.id}`, '/timesheets', `/timesheets/${timesheet.id}`, '/documents',
      '/invoices', `/invoices/${invoice.id}`, '/reports', '/company', '/team', '/settings',
    ]
    const employerPortal = await openPortal(browser, 'http://localhost:5178', employerLogin.session)
    for (const route of employerRoutes) await visit(employerPortal.page, 'http://localhost:5178', route, employerPortal.pageErrors, employerPortal.apiErrors)
    await employerPortal.page.goto('http://localhost:5178/login', { waitUntil: 'domcontentloaded' })
    await employerPortal.page.waitForURL('http://localhost:5177/login', { timeout: 10000 })
    console.log('OK   employer login redirect')
    await employerPortal.context.close()

    const candidateRoutes = [
      '/dashboard', '/jobs', `/jobs/${job.id}`, '/applications', `/applications/${application.id}`, '/saved-jobs',
      '/profile', '/documents', '/interviews', '/notifications', '/settings',
    ]
    const candidatePortal = await openPortal(browser, 'http://localhost:5179', registered.session)
    for (const route of candidateRoutes) await visit(candidatePortal.page, 'http://localhost:5179', route, candidatePortal.pageErrors, candidatePortal.apiErrors)
    const candidateLogin = await browser.newPage()
    await candidateLogin.goto('http://localhost:5179/login', { waitUntil: 'domcontentloaded' })
    await candidateLogin.getByRole('heading', { name: 'Sign in' }).waitFor({ timeout: 10000 })
    console.log('OK   candidate login form')
    await candidateLogin.goto('http://localhost:5179/register', { waitUntil: 'domcontentloaded' })
    await candidateLogin.getByRole('heading', { name: 'Create your account' }).waitFor({ timeout: 10000 })
    console.log('OK   candidate register form')
    await candidateLogin.close()
    await candidatePortal.page.goto('http://localhost:5179/forgot-password', { waitUntil: 'domcontentloaded' })
    await candidatePortal.page.locator('#email').fill(`walk-candidate-${stamp}@staffora.test`)
    await candidatePortal.page.getByRole('button', { name: 'Request password reset' }).click()
    await candidatePortal.page.locator('.text-success').waitFor({ timeout: 10000 })
    console.log('OK   forgot password form')
    await candidatePortal.context.close()
  } finally {
    await browser.close()
  }

  if (interview.id) ids.add(interview.id)
  console.log(problems.length ? `FRONTEND FAILED ${problems.length}` : 'ALL FRONTEND PAGES PASSED')
  problems.forEach((line) => console.log(line))
  if (problems.length) process.exitCode = 1
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => cleanup().catch((error) => {
    console.error('cleanup failed', error.message)
    process.exitCode = 1
  }))
