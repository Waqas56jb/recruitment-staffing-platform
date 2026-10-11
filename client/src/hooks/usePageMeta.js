import { useEffect } from 'react'
import { siteConfig } from '../config/site'

export function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    const nextTitle = title
      ? siteConfig.seo.titleTemplate.replace('%s', title)
      : siteConfig.seo.defaultTitle
    document.title = nextTitle

    const desc = description || siteConfig.seo.defaultDescription
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
  }, [title, description])
}
