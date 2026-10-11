import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import Container from '../ui/Container'

const STORAGE_KEY = 'staffora-cookie-prefs'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const save = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-line bg-white py-4 shadow-soft">
      <Container className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold">
            Cookie preferences
          </p>
          <p className="mt-1 text-sm text-muted">
            We use essential cookies to run the site and optional cookies to improve experience.
            Manage preferences any time on the Cookie Policy page.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => save({ essential: true, analytics: false, updatedAt: Date.now() })}
          >
            Essential only
          </Button>
          <Button
            size="sm"
            onClick={() => save({ essential: true, analytics: true, updatedAt: Date.now() })}
          >
            Accept all
          </Button>
        </div>
      </Container>
    </div>
  )
}
