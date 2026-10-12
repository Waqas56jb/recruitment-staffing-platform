import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { siteConfig } from '../../config/site'
import CookieBanner from './CookieBanner'
import Footer from './Footer'
import Header from './Header'

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        window.setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 80)
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [location.pathname, location.hash])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {siteConfig.contact.whatsapp ? (
        <a
          href={siteConfig.contact.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-24 right-5 z-[80] rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lift hover:bg-[#1ebe5d]"
        >
          WhatsApp
        </a>
      ) : null}
      <CookieBanner />
    </div>
  )
}
