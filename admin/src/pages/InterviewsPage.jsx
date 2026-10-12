import { useState } from 'react'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { formatDateTime } from '../utils/format'
import { required } from '../utils/validation'

export default function InterviewsPage() {
  const { state, createInterview, updateInterview } = useData()
  const { push } = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ candidateId: '', jobId: '', companyId: '', datetime: '', type: 'Video', interviewer: '', locationOrLink: '' })
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = () => {
    const next = { datetime: required(form.datetime), interviewer: required(form.interviewer) }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    createInterview({ ...form, companyId: state.jobs.find((job) => job.id === form.jobId)?.companyId || form.companyId, status: 'Scheduled', feedback: '' })
    push({ title: 'Interview saved', message: 'It is stored on this candidate.' })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader title="Interviews" description="Schedule interviews and record feedback." actions={<Button onClick={() => { setForm((current) => ({ ...current, candidateId: state.candidates[0]?.id || '', jobId: state.jobs[0]?.id || '', companyId: state.jobs[0]?.companyId || state.companies[0]?.id || '' })); setOpen(true) }}>Schedule interview</Button>} breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Interviews' }]} />
      <div className="grid gap-4 md:grid-cols-2">
        {state.interviews.map((item) => {
          const cand = state.candidates.find((c) => c.id === item.candidateId)
          const job = state.jobs.find((j) => j.id === item.jobId)
          return (
            <Card key={item.id} className="space-y-2 text-sm">
              <div className="flex justify-between gap-2"><h2 className="font-display text-lg font-semibold">{cand?.fullName}</h2><Badge tone={statusTone(item.status)}>{item.status}</Badge></div>
              <p>{job?.title}</p>
              <p>{formatDateTime(item.datetime)} · {item.type}</p>
              <p className="text-muted">{item.interviewer} · {item.locationOrLink}</p>
              <Field id={`fb-${item.id}`} label="Feedback">
                <textarea id={`fb-${item.id}`} className="input-field" rows={2} defaultValue={item.feedback} onBlur={(e) => updateInterview(item.id, { feedback: e.target.value })} />
              </Field>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => updateInterview(item.id, { status: 'Completed' })}>Mark completed</Button>
                <Button size="sm" variant="danger" onClick={() => updateInterview(item.id, { status: 'Cancelled' })}>Cancel</Button>
              </div>
            </Card>
          )
        })}
      </div>
      <Modal open={open} title="Schedule interview" onClose={() => setOpen(false)} footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="space-y-3">
          <Field id="candidateId" label="Candidate"><select id="candidateId" className="input-field" value={form.candidateId} onChange={(e) => set('candidateId', e.target.value)}>{state.candidates.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}</select></Field>
          <Field id="jobId" label="Job"><select id="jobId" className="input-field" value={form.jobId} onChange={(e) => set('jobId', e.target.value)}>{state.jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</select></Field>
          <Field id="datetime" label="Date & time" required error={errors.datetime}><input id="datetime" type="datetime-local" className="input-field" value={form.datetime} onChange={(e) => set('datetime', e.target.value)} /></Field>
          <Field id="interviewer" label="Interviewer" required error={errors.interviewer}><input id="interviewer" className="input-field" value={form.interviewer} onChange={(e) => set('interviewer', e.target.value)} /></Field>
          <Field id="locationOrLink" label="Location / link"><input id="locationOrLink" className="input-field" value={form.locationOrLink} onChange={(e) => set('locationOrLink', e.target.value)} /></Field>
        </div>
      </Modal>
    </div>
  )
}
