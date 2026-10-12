import { translate } from '../i18n'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function required(value, message = 'This field is required') {
  if (value === undefined || value === null) return translate(message)
  if (typeof value === 'string' && !value.trim()) return translate(message)
  if (typeof value === 'boolean' && value !== true) return translate(message)
  return ''
}

export function email(value, message = 'Enter a valid email address') {
  if (!value) return ''
  return EMAIL_RE.test(String(value).trim()) ? '' : translate(message)
}

export function optionalPhone(value, message = 'Enter a valid phone number') {
  if (!value || !String(value).trim()) return ''
  const cleaned = String(value).replace(/[\s()-]/g, '')
  return /^[+]?[\d]{7,15}$/.test(cleaned) ? '' : translate(message)
}

export const CV_ACCEPT = ['.pdf', '.doc', '.docx']
export const CV_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
export const CV_MAX_BYTES = 5 * 1024 * 1024

export function validateCvFile(file) {
  if (!file) return ''
  const name = file.name.toLowerCase()
  const extOk = CV_ACCEPT.some((ext) => name.endsWith(ext))
  const mimeOk = !file.type || CV_MIME.includes(file.type)
  if (!extOk || !mimeOk) {
    return translate('Upload a PDF or Word document (.pdf, .doc, .docx)')
  }
  if (file.size > CV_MAX_BYTES) {
    return translate('File must be 5MB or smaller')
  }
  return ''
}

export function collectErrors(rules) {
  const errors = {}
  for (const [field, message] of Object.entries(rules)) {
    if (message) errors[field] = message
  }
  return errors
}
