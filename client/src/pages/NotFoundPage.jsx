import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

export default function NotFoundPage() {
  const { t } = useI18n()
  usePageMeta({
    title: t('Page not found'),
    description: t('The page you requested could not be found.'),
  })

  return (
    <section className="flex min-h-[80vh] items-center bg-ink text-cream">
      <Container className="py-28">
        <p className="eyebrow text-gold-soft">404</p>
        <h1 className="display-xl mt-4">{t('Page not found')}</h1>
        <p className="mt-5 max-w-xl text-cream/75">
          {t('The page may have moved, or the link might be incorrect. Head back to the homepage or browse open sample opportunities.')}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/" variant="secondary">
            {t('Back home')}
          </Button>
          <Button to="/jobs" variant="lightOutline">
            {t('Browse jobs')}
          </Button>
        </div>
      </Container>
    </section>
  )
}
