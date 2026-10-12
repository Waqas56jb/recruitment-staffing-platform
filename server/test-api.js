require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const { Client } = require('pg')

const base = String(process.env.API_BASE || 'https://recruitment-staffing-platform.vercel.app').replace(/\/$/, '')
const stamp = Date.now().toString(36)
const ids = new Set()
const startedAt = new Date()
let failed = 0

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

async function call(name, path, options = {}, token) {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${base}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))
  const ok = options.expect ? response.status === options.expect : response.ok
  if (!ok) {
    failed += 1
    console.log(`FAIL ${name} ${response.status} ${data.error || ''}`)
  } else {
    console.log(`OK   ${name}`)
  }
  if (response.ok) collect(data)
  return { response, data }
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
  const tables = [
    'saved_jobs',
    'applications',
    'interviews',
    'timesheets',
    'payroll_entries',
    'documents',
    'invoices',
    'placements',
    'workers',
    'jobs',
    'staffing_requests',
    'enquiries',
    'notifications',
    'audit_events',
    'candidates',
    'companies',
  ]
  for (const name of tables) {
    if (name === 'saved_jobs') {
      await client.query(`delete from ${prefix}${name} where user_id = any($1::text[]) or job_id = any($1::text[])`, [list])
    } else if (list.length) {
      await client.query(`delete from ${prefix}${name} where id = any($1::text[])`, [list])
    }
    if (name === 'notifications' || name === 'audit_events') {
      await client.query(`delete from ${prefix}${name} where created_at >= $1`, [startedAt])
    }
  }
  await client.query(`delete from ${prefix}users where email like $1`, ['cli-test-%'])
  await client.end()
}

async function main() {
  const health = await call('health', '/api/health')
  const foreign = (health.data.tables || []).filter((name) => !name.startsWith('recruitment_staffing_platform_'))
  if (foreign.length) {
    failed += 1
    console.log('FAIL health returned a table outside the prefix')
  }

  const login = await call('login super admin', '/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: process.env.BOOTSTRAP_ADMIN_EMAIL,
      password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
    }),
  })
  const superToken = login.data.token
  if (!superToken) throw new Error('Super admin login failed')

  await call('me', '/api/auth/me', {}, superToken)
  await call('settings', '/api/me/settings', { method: 'PATCH', body: JSON.stringify({ timezone: 'UTC', currency: 'GBP' }) }, superToken)
  await call('state', '/api/state', {}, superToken)
  await call('users', '/api/users', {}, superToken)

  const company = await call('create company', '/api/companies', {
    method: 'POST',
    body: JSON.stringify({ name: `CLI Test ${stamp}`, contactName: 'CLI Contact', email: `cli-test-co-${stamp}@staffora.test`, industry: 'Logistics', phone: '07000000000' }),
  }, superToken)
  const companyId = company.data.id

  const employer = await call('provision employer', `/api/companies/${companyId}/users`, {
    method: 'POST',
    body: JSON.stringify({ name: 'CLI Employer', email: `cli-test-employer-${stamp}@staffora.test`, password: 'EmployerPass1', role: 'Company Admin' }),
  }, superToken)
  if (employer.data.account?.id) ids.add(employer.data.account.id)

  const adminTry = await call('admin cannot be created by candidate later', '/api/users', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ name: 'CLI Admin', email: `cli-test-admin-${stamp}@staffora.test`, password: 'AdminPass123', role: 'Admin' }),
  }, superToken)
  const adminToken = (await call('login admin', '/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: `cli-test-admin-${stamp}@staffora.test`, password: 'AdminPass123' }),
  })).data.token

  await call('admin cannot create admin', '/api/users', {
    method: 'POST',
    expect: 403,
    body: JSON.stringify({ name: 'Nope', email: `cli-test-nope-${stamp}@staffora.test`, password: 'AdminPass123', role: 'Admin' }),
  }, adminToken)
  await call('admin creates sub admin', '/api/users', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ name: 'CLI Sub', email: `cli-test-sub-${stamp}@staffora.test`, password: 'SubAdmin123', role: 'Sub Admin' }),
  }, adminToken)
  const adminUsers = await call('admin user list hides passwords', '/api/users', {}, adminToken)
  if ((adminUsers.data.accounts || []).some((account) => account.password)) {
    failed += 1
    console.log('FAIL admin can see a password')
  }
  await call('admin cannot delete', `/api/users/${adminTry.data.account?.id || 'missing'}`, { method: 'DELETE', expect: 403 }, adminToken)

  const subToken = (await call('login sub admin', '/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: `cli-test-sub-${stamp}@staffora.test`, password: 'SubAdmin123' }),
  })).data.token
  await call('sub admin cannot create', '/api/users', {
    method: 'POST',
    expect: 403,
    body: JSON.stringify({ name: 'Nope', email: `cli-test-nope2-${stamp}@staffora.test`, password: 'SubAdmin123', role: 'Sub Admin' }),
  }, subToken)
  const subList = await call('sub admin sees no accounts', '/api/users', {}, subToken)
  if ((subList.data.accounts || []).length) {
    failed += 1
    console.log('FAIL sub admin can see accounts')
  }

  const superUsers = await call('super admin sees password', '/api/users', {}, superToken)
  const subRow = (superUsers.data.accounts || []).find((account) => account.email === `cli-test-sub-${stamp}@staffora.test`)
  if (!subRow?.password) {
    failed += 1
    console.log('FAIL super admin password column is empty')
  } else {
    console.log('OK   super admin password visible')
  }
  await call('change password', `/api/users/${subRow.id}`, { method: 'PATCH', body: JSON.stringify({ password: 'SubAdmin456' }) }, superToken)
  await call('login new password', '/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: `cli-test-sub-${stamp}@staffora.test`, password: 'SubAdmin456' }),
  })
  await call('delete sub admin', `/api/users/${subRow.id}`, { method: 'DELETE' }, superToken)
  await call('cannot delete self', `/api/users/${login.data.session.id}`, { method: 'DELETE', expect: 403 }, superToken)

  const job = await call('create job', '/api/jobs', {
    method: 'POST',
    body: JSON.stringify({
      title: `CLI Warehouse ${stamp}`,
      companyId,
      location: 'Birmingham',
      employmentType: 'Temporary',
      category: 'Logistics',
      description: 'Pick and pack for the CLI test.',
      responsibilities: ['Pick orders'],
      requirements: ['Right to work'],
      status: 'Published',
      salaryLabel: 'Hourly',
    }),
  }, superToken)
  const jobId = job.data.id
  await call('patch job', `/api/jobs/${jobId}`, { method: 'PATCH', body: JSON.stringify({ salaryLabel: 'Competitive hourly' }) }, superToken)
  const publicJobs = await call('public jobs', '/api/public/jobs')
  if (!(publicJobs.data || []).some((item) => item.id === jobId)) {
    failed += 1
    console.log('FAIL published job missing from public list')
  }
  await call('public job', `/api/public/jobs/${jobId}`)

  await call('contact', '/api/public/contact', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ name: 'CLI Person', email: `cli-test-contact-${stamp}@staffora.test`, enquiryType: 'General', subject: 'CLI', message: 'Hello from CLI', privacy: true }),
  })
  const staffing = await call('public staffing', '/api/public/staffing-requests', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({
      companyName: `CLI Public Co ${stamp}`,
      contactName: 'Public Contact',
      businessEmail: `cli-test-public-${stamp}@staffora.test`,
      industry: 'Retail',
      jobRoles: 'Sales assistant',
      headcount: '2',
      location: 'Leeds',
      employmentType: 'Temporary',
      privacy: true,
    }),
  })
  const interest = await call('candidate interest', '/api/public/candidate-interest', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({
      fullName: 'CLI Interest',
      email: `cli-test-interest-${stamp}@staffora.test`,
      preferredRole: 'Picker',
      preferredLocation: 'Leeds',
      employmentType: 'Temporary',
      skills: 'picking, packing',
      cvFileName: 'cv.pdf',
      cvSizeLabel: '20 KB',
      privacy: true,
    }),
  })

  const registered = await call('register candidate', '/api/auth/register', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ name: 'CLI Candidate', email: `cli-test-candidate-${stamp}@staffora.test`, password: 'Candidate123' }),
  })
  const candidateToken = registered.data.token
  if (registered.data.session?.id) ids.add(registered.data.session.id)
  if (registered.data.session?.candidateId) ids.add(registered.data.session.candidateId)
  await call('forgot password', '/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: `cli-test-candidate-${stamp}@staffora.test` }),
  })
  await call('candidate state', '/api/state', {}, candidateToken)
  await call('save job', '/api/saved-jobs/toggle', { method: 'POST', body: JSON.stringify({ jobId }) }, candidateToken)
  const application = await call('apply', '/api/applications', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ jobId, coverLetter: 'I can start Monday.', availability: 'Immediate' }),
  }, candidateToken)
  await call('duplicate application', '/api/applications', {
    method: 'POST',
    expect: 409,
    body: JSON.stringify({ jobId, coverLetter: 'Again', availability: 'Immediate' }),
  }, candidateToken)
  await call('candidate document', '/api/documents', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ title: 'CV metadata', category: 'CV metadata', fileName: 'cv.pdf' }),
  }, candidateToken)
  await call('candidate settings', '/api/me/settings', { method: 'PATCH', body: JSON.stringify({ jobAlerts: true }) }, candidateToken)
  await call('candidate cannot list users', '/api/users', {}, candidateToken)
  if ((await call('candidate users status', '/api/users', {}, candidateToken)).data.accounts?.length) {
    failed += 1
    console.log('FAIL candidate received accounts')
  }

  const employerLogin = await call('login employer', '/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: `cli-test-employer-${stamp}@staffora.test`, password: 'EmployerPass1' }),
  })
  const employerToken = employerLogin.data.token
  const employerState = await call('employer state', '/api/state', {}, employerToken)
  if ((employerState.data.companies || []).some((item) => item.id !== companyId)) {
    failed += 1
    console.log('FAIL employer can see another company')
  }
  await call('employer request', '/api/staffing-requests', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ title: 'Night shift', role: 'Operative', headcount: 3, location: 'Birmingham', employmentType: 'Temporary', status: 'Submitted', skills: ['picking'] }),
  }, employerToken)
  await call('employer cannot create placement', '/api/placements', {
    method: 'POST',
    expect: 403,
    body: JSON.stringify({ candidateId: interest.data.candidateId, companyId, role: 'Operative' }),
  }, employerToken)

  await call('move application', `/api/applications/${application.data.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'Interview', note: 'CLI move' }),
  }, superToken)
  const interview = await call('interview', '/api/interviews', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ candidateId: registered.data.session.candidateId, jobId, companyId, datetime: new Date().toISOString(), interviewer: 'CLI Recruiter', type: 'Video' }),
  }, superToken)
  await call('interview feedback', `/api/interviews/${interview.data.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Completed', feedback: 'Good' }) }, superToken)
  const placed = await call('placement', '/api/placements', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ candidateId: registered.data.session.candidateId, companyId, jobId, role: 'Warehouse Operative', location: 'Birmingham', employmentType: 'Temporary', startDate: '2026-10-20', rate: 13, rateUnit: 'hour' }),
  }, superToken)
  if (placed.data.worker?.id) ids.add(placed.data.worker.id)
  if (placed.data.placement?.id) ids.add(placed.data.placement.id)
  const timesheet = await call('timesheet', '/api/timesheets', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ workerId: placed.data.worker.id, weekEnding: '2026-10-18', regularHours: 40, overtimeHours: 2, breakHours: 2.5, status: 'Submitted' }),
  }, superToken)
  await call('approve timesheet', `/api/timesheets/${timesheet.data.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Approved' }) }, superToken)
  const period = await call('payroll period', '/api/payroll-periods', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ label: `CLI week ${stamp}`, startDate: '2026-10-12', endDate: '2026-10-18' }),
  }, superToken)
  const entry = await call('payroll entry', '/api/payroll-entries', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ periodId: period.data.id, workerId: placed.data.worker.id, regularHours: 40, overtimeHours: 2, hourlyRate: 13, timesheetIds: [timesheet.data.id] }),
  }, superToken)
  await call('approve payroll', `/api/payroll-entries/${entry.data.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Approved' }) }, superToken)
  const invoice = await call('invoice', '/api/invoices', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ companyId, dueDate: '2026-11-01', engagementLabel: 'Warehouse cover', lineItems: [{ description: 'Hours', quantity: 40, unitRate: 18 }], status: 'Draft' }),
  }, superToken)
  if (Number(invoice.data.total) <= Number(invoice.data.subtotal)) {
    failed += 1
    console.log('FAIL invoice tax was not calculated')
  } else {
    console.log('OK   invoice totals')
  }
  await call('mark invoice paid', `/api/invoices/${invoice.data.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Paid' }) }, superToken)
  await call('document', '/api/documents', {
    method: 'POST',
    expect: 201,
    body: JSON.stringify({ title: 'Right to work', category: 'Compliance', companyId }),
  }, superToken)
  const notes = await call('notifications', '/api/notifications', {}, superToken)
  const note = (notes.data || [])[0]
  if (note) await call('read notification', `/api/notifications/${note.id}`, { method: 'PATCH', body: JSON.stringify({ read: true }) }, superToken)
  await call('read many', '/api/notifications/read', { method: 'POST', body: JSON.stringify({ ids: (notes.data || []).map((item) => item.id) }) }, superToken)
  await call('audit', '/api/audit-events', {}, superToken)
  await call('enquiries', '/api/enquiries', {}, superToken)
  await call('candidates', '/api/candidates', {}, superToken)
  await call('patch candidate', `/api/candidates/${registered.data.session.candidateId}`, { method: 'PATCH', body: JSON.stringify({ headline: 'Warehouse operative' }) }, superToken)
  await call('worker', `/api/workers/${placed.data.worker.id}`, {}, superToken)
  await call('patch worker', `/api/workers/${placed.data.worker.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Active' }) }, superToken)
  await call('patch company', `/api/companies/${companyId}`, { method: 'PATCH', body: JSON.stringify({ phone: '07000000001' }) }, superToken)
  if (staffing.data.staffingRequestId) {
    await call('patch public request', `/api/staffing-requests/${staffing.data.staffingRequestId}`, { method: 'PATCH', body: JSON.stringify({ status: 'Under Review' }) }, superToken)
  }
  await call('unsave job', '/api/saved-jobs/toggle', { method: 'POST', body: JSON.stringify({ jobId }) }, candidateToken)
  await call('withdraw', `/api/applications/${application.data.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Withdrawn' }) }, candidateToken)
  await call('unknown route', '/api/does-not-exist', { expect: 404 })

  console.log(failed ? `FAILED ${failed}` : 'ALL API CHECKS PASSED')
  if (failed) process.exitCode = 1
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
