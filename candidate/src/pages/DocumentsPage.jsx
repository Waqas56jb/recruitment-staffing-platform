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
import { useI18n } from '../i18n'

export default function DocumentsPage() {
  const { t } = useI18n()
  const { state, addDocument, updateCandidate } = useData()
  const { push } = useToast()
  const candidate = state.candidates.find((c) => c.id === state.candidateProfileId)
  const docs = state.documents.filter((d) => d.candidateId === state.candidateProfileId)
  const [fileLabel, setFileLabel] = useState('')

  const uploadMeta = () => {
    if (!fileLabel.trim()) {
      push({ title: t('Add a file name'), message: t('Enter a label to simulate a CV upload.'), tone: 'error' })
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
    push({ title: t('CV details saved'), message: t('The file name is stored. The file itself stays on this device.') })
    setFileLabel('')
  }

  return (
    <div>
      <PageHeader title={t('Documents')} description={t('CV details and documents stored on your profile.')} breadcrumbs={[{ label: t('Home'), to: '/dashboard' }, { label: t('Documents') }]} />
      <Card className="mb-6 space-y-3">
        <h2 className="font-display text-lg font-semibold">{t('CV upload (simulated)')}</h2>
        <p className="text-sm text-muted">{t('Current:')} {candidate?.cvMeta?.fileName || t('None')} · {candidate?.cvMeta?.sizeLabel ? t(candidate.cvMeta.sizeLabel) : '—'}</p>
        <Field id="file" label={t('File name label')}>
          <input id="file" className="input-field" placeholder="cv.pdf" value={fileLabel} onChange={(e) => setFileLabel(e.target.value)} />
        </Field>
        <Button onClick={uploadMeta}>{t('Save CV metadata')}</Button>
      </Card>
      <DataTable
        rows={docs}
        columns={[
          { key: 'title', label: t('Document') },
          { key: 'category', label: t('Category'), render: (d) => t(d.category) },
          { key: 'issuedAt', label: t('Issued'), render: (d) => formatDate(d.issuedAt) },
          { key: 'status', label: t('Status'), render: (d) => <Badge tone={statusTone(d.status)}>{d.status}</Badge> },
        ]}
        emptyTitle={t('No documents yet')}
      />
    </div>
  )
}
