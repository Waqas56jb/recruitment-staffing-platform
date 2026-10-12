import { useState } from 'react'
import Badge, { statusTone } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataTable from '../components/ui/DataTable'
import Field from '../components/ui/Field'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../components/ui/Toast'
import { useData } from '../context/DataContext'
import { formatDate } from '../utils/format'

export default function DocumentsPage() {
  const { state, addDocument, updateCandidate } = useData()
  const { push } = useToast()
  const candidate = state.candidates.find((c) => c.id === state.candidateProfileId)
  const docs = state.documents.filter((d) => d.candidateId === state.candidateProfileId)
  const [fileLabel, setFileLabel] = useState('')

  const uploadMeta = () => {
    if (!fileLabel.trim()) {
      push({ title: 'Add a file name', message: 'Enter a label to simulate a CV upload.', tone: 'error' })
      return
    }
    addDocument({
      title: `CV metadata — ${candidate?.fullName || 'Candidate'}`,
      category: 'CV metadata',
      candidateId: state.candidateProfileId,
      companyId: null,
      workerId: null,
      placementId: null,
      expiresAt: null,
    })
    updateCandidate(state.candidateProfileId, {
      cvMeta: { fileName: fileLabel.trim(), sizeLabel: 'Demo only', updatedAt: new Date().toISOString().slice(0, 10) },
    })
    push({ title: 'CV details saved', message: 'The file name is stored. The file itself stays on this device.' })
    setFileLabel('')
  }

  return (
    <div>
      <PageHeader title="Documents" description="CV details and documents stored on your profile." breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Documents' }]} />
      <Card className="mb-6 space-y-3">
        <h2 className="font-display text-lg font-semibold">CV upload (simulated)</h2>
        <p className="text-sm text-muted">Current: {candidate?.cvMeta?.fileName || 'None'} · {candidate?.cvMeta?.sizeLabel || '—'}</p>
        <Field id="file" label="File name label">
          <input id="file" className="input-field" placeholder="cv.pdf" value={fileLabel} onChange={(e) => setFileLabel(e.target.value)} />
        </Field>
        <Button onClick={uploadMeta}>Save CV metadata</Button>
      </Card>
      <DataTable
        rows={docs}
        columns={[
          { key: 'title', label: 'Document' },
          { key: 'category', label: 'Category' },
          { key: 'issuedAt', label: 'Issued', render: (d) => formatDate(d.issuedAt) },
          { key: 'status', label: 'Status', render: (d) => <Badge tone={statusTone(d.status)}>{d.status}</Badge> },
        ]}
        emptyTitle="No documents yet"
      />
    </div>
  )
}
