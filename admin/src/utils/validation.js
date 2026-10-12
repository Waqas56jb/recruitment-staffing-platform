import { translate } from '../i18n'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function required(v, msg = 'Required') {
  if (v === undefined || v === null) return translate(msg)
  if (typeof v === 'string' && !v.trim()) return translate(msg)
  if (typeof v === 'boolean' && v !== true) return translate(msg)
  return ''
}
export function email(v, msg = 'Enter a valid email') {
  if (!v) return ''
  return EMAIL_RE.test(String(v).trim()) ? '' : translate(msg)
}
export function positiveNumber(v, msg = 'Enter a valid number') {
  if (v === '' || v === undefined || v === null) return translate(msg)
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? '' : translate(msg)
}
export const CV_ACCEPT = ['.pdf', '.doc', '.docx']
export const CV_MAX = 5 * 1024 * 1024
export function validateCvMeta(file) {
  if (!file) return ''
  const name = file.name.toLowerCase()
  if (!CV_ACCEPT.some((ext) => name.endsWith(ext))) return translate('Use PDF or Word (.pdf, .doc, .docx)')
  if (file.size > CV_MAX) return translate('File must be 5MB or smaller')
  return ''
}
