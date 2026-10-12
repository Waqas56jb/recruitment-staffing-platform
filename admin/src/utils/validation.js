const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function required(v, msg = 'Required') {
  if (v === undefined || v === null) return msg
  if (typeof v === 'string' && !v.trim()) return msg
  if (typeof v === 'boolean' && v !== true) return msg
  return ''
}
export function email(v, msg = 'Enter a valid email') {
  if (!v) return ''
  return EMAIL_RE.test(String(v).trim()) ? '' : msg
}
export function positiveNumber(v, msg = 'Enter a valid number') {
  if (v === '' || v === undefined || v === null) return msg
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? '' : msg
}
export const CV_ACCEPT = ['.pdf', '.doc', '.docx']
export const CV_MAX = 5 * 1024 * 1024
export function validateCvMeta(file) {
  if (!file) return ''
  const name = file.name.toLowerCase()
  if (!CV_ACCEPT.some((ext) => name.endsWith(ext))) return 'Use PDF or Word (.pdf, .doc, .docx)'
  if (file.size > CV_MAX) return 'File must be 5MB or smaller'
  return ''
}
