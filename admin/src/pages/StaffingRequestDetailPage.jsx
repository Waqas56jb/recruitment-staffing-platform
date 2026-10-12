import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

const STATUSES = ['Submitted','Under Review','Sourcing Candidates','Shortlisting','Interviews','Filled','Cancelled']

export default function StaffingRequestDetailPage() {
  const { id } = useParams()
  const { state, updateStaffingRequest } = useData()
  const request = state.staffingRequests.find((r) => r.id === id)
  const { push } = useToast()
  const [status, setStatus] = useState(request?.status || '')
  if (!request) return <EmptyState title="Request not found" actionLabel="Back" actionTo="/staffing-requests" />
  const company = state.companies.find((c) => c.id === request.companyId)
  return (
    <div>
      <PageHeader title={request.title} description={`${request.role} · ${company?.name || ''}`} breadcrumbs={[{ label: 'Requests', to: '/staffing-requests' }, { label: request.title }]} />
      <div className="mb-4"><Badge tone={statusTone(request.status)}>{request.status}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-2 text-sm">
          <p><strong>Location:</strong> {request.location}</p>
          <p><strong>Headcount:</strong> {request.headcount}</p>
          <p><strong>Type:</strong> {request.employmentType}</p>
          <p><strong>Start:</strong> {formatDate(request.startDate)}</p>
          <p><strong>Skills:</strong> {(request.skills || []).join(', ')}</p>
          <p className="text-muted">{request.description}</p>
        </Card>
        <Card className="space-y-3">
          <Field id="status" label="Update status">
            <select id="status" className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Button onClick={() => { updateStaffingRequest(id, { status }); push({ title: 'Status saved', message: 'The request status is updated.' }) }}>Save status</Button>
          <Link className="block text-xs font-semibold text-accent" to="/recruitment">Open recruitment board</Link>
        </Card>
      </div>
    </div>
  )
}
