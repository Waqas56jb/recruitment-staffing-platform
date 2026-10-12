import { getLocale } from '../i18n'

export function formatDate(value) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
  } catch { return String(value) }
}

export function formatDateTime(value) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat(getLocale(), {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(value))
  } catch { return String(value) }
}

export function formatMoney(amount, currency = 'GBP') {
  return new Intl.NumberFormat(getLocale(), { style: 'currency', currency }).format(Number(amount) || 0)
}

export function uid(prefix = 'id') {
  return prefix + '-' + Math.random().toString(36).slice(2, 9)
}
