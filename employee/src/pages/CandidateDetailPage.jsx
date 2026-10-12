import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'

const reviewsKey = 'staffora-employer-candidate-reviews'

export default function CandidateDetailPage() {
  const { id } = useParams()
  const { push } = useToast()
  const { state } = useData()
  const candidate = state.candidates.find((c) => c.id === id)
  const [note, setNote] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(reviewsKey) || '{}')[id]?.note || '' } catch { return '' }
  })
  const [status, setStatus] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(reviewsKey) || '{}')[id]?.status || 'Under consideration' } catch { return 'Under consideration' }
  })

  if (!candidate) return <EmptyState title="Candidate not found" actionLabel="Back" actionTo="/candidates" />

  const saveReview = (nextStatus) => {
    const all = JSON.parse(sessionStorage.getItem(reviewsKey) || '{}')
    all[id] = { note, status: nextStatus || status }
    sessionStorage.setItem(reviewsKey, JSON.stringify(all))
    if (nextStatus) setStatus(nextStatus)
    push({ title: 'Review saved', message: 'Your notes are stored on this candidate.' })
  }

  return (
    <div>
      <PageHeader title={candidate.fullName} description={candidate.headline} breadcrumbs={[{ label: 'Candidates', to: '/candidates' }, { label: candidate.fullName }]} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone="gold">{status}</Badge>
        <Badge tone="cream">{candidate.availability}</Badge>
        <Badge tone="muted">{candidate.city}</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-4 text-sm">
          <p className="text-muted">{candidate.bio}</p>
          <div>
            <p className="font-display text-sm font-semibold">Skills</p>
            <div className="mt-2 flex flex-wrap gap-2">{candidate.skills.map((s) => <Badge key={s}>{s}</Badge>)}</div>
          </div>
          <div>
            <p className="font-display text-sm font-semibold">Experience</p>
            {candidate.experience.map((ex) => (
              <div key={ex.id} className="mt-2 rounded-md border border-line p-3">
                <p className="font-medium">{ex.title} · {ex.employer}</p>
                <p className="text-xs text-muted">{ex.startDate} – {ex.current ? 'Present' : ex.endDate}</p>
                <p className="mt-1 text-muted">{ex.description}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted">Review the skills, location, and applications linked to your company.</p>
        </Card>
        <Card className="space-y-3">
          <Field id="note" label="Internal employer note">
            <textarea id="note" className="input-field" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <Button className="w-full" variant="outline" onClick={() => saveReview()}>Save note</Button>
          <Button className="w-full" onClick={() => saveReview('Shortlisted')}>Shortlist</Button>
          <Button className="w-full" variant="secondary" onClick={() => saveReview('Interview requested')}>Request interview</Button>
          <Button className="w-full" variant="danger" onClick={() => saveReview('Rejected')}>Reject</Button>
        </Card>
      </div>
    </div>
  )
}
