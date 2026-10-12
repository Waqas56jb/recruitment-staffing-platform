import { useI18n } from '../../i18n'
import Button from './Button'
import Modal from './Modal'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', tone = 'primary', onConfirm, onClose, loading, children }) {
  const { t } = useI18n()
  return (
    <Modal
      open={open}
      title={typeof title === 'string' ? t(title) : title}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>{t('Cancel')}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
            {loading ? t('Working…') : (typeof confirmLabel === 'string' ? t(confirmLabel) : confirmLabel)}
          </Button>
        </>
      }
    >
      {message ? <p className="text-muted">{typeof message === 'string' ? t(message) : message}</p> : null}
      {children}
    </Modal>
  )
}
