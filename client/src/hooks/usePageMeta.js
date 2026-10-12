import { useEffect } from 'react'
import { siteConfig } from '../config/site'
import { translate, useI18n } from '../i18n'

export function usePageMeta({ title, description } = {}) {
  const { lang } = useI18n()
  useEffect(() => {
    const nextTitle = title
      ? siteConfig.seo.titleTemplate.replace('%s', translate(title, undefined, lang))
      : translate(siteConfig.seo.defaultTitle, undefined, lang)
    document.title = nextTitle

    const desc = translate(description || siteConfig.seo.defaultDescription, undefined, lang)
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', desc)

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', nextTitle)
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', desc)
  }, [title, description, lang])
}
