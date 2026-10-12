import Button from './Button'
import Modal from './Modal'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', tone = 'primary', onConfirm, onClose, loading, children }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    >
      {message ? <p className="text-muted">{message}</p> : null}
      {children}
    </Modal>
  )
}
