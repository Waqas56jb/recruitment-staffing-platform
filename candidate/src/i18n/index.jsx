import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN', locale: 'en-GB' },
  { code: 'nl', label: 'Nederlands', short: 'NL', locale: 'nl-NL' },
  { code: 'fr', label: 'Français', short: 'FR', locale: 'fr-FR' },
]

const STORAGE_KEY = 'staffora.lang'
const DEFAULT_LANG = 'en'

// Every file in ./messages exports { nl: {...}, fr: {...} } keyed by the English source text.
const modules = import.meta.glob('./messages/*.js', { eager: true })
const dictionaries = { en: {}, nl: {}, fr: {} }
for (const mod of Object.values(modules)) {
  const messages = mod.default || {}
  for (const code of Object.keys(dictionaries)) Object.assign(dictionaries[code], messages[code] || {})
}

function readStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (LANGUAGES.some((l) => l.code === stored)) return stored
  } catch { /* storage unavailable */ }
  return DEFAULT_LANG
}

let currentLang = readStoredLang()

export function getLang() {
  return currentLang
}

export function getLocale(lang = currentLang) {
  return (LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]).locale
}

function interpolate(text, vars) {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (match, name) => (vars[name] ?? vars[name] === 0 ? String(vars[name]) : match))
}

// Translate outside React (utils, data). Falls back to the English source text.
export function translate(text, vars, lang = currentLang) {
  if (text === undefined || text === null || text === '') return text
  const source = String(text)
  const translated = lang === 'en' ? source : dictionaries[lang]?.[source] ?? source
  return interpolate(translated, vars)
}

const I18nContext = createContext({ lang: DEFAULT_LANG, setLang: () => {}, t: translate, locale: getLocale(DEFAULT_LANG) })

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(currentLang)

  const setLang = useCallback((code) => {
    if (!LANGUAGES.some((l) => l.code === code)) return
    currentLang = code
    try { localStorage.setItem(STORAGE_KEY, code) } catch { /* storage unavailable */ }
    setLangState(code)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => ({
    lang,
    setLang,
    locale: getLocale(lang),
    t: (text, vars) => translate(text, vars, lang),
  }), [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
