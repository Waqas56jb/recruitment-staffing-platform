import { getLocale } from '../i18n'

export function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat(getLocale(), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function currentYear() {
  return new Date().getFullYear()
}
