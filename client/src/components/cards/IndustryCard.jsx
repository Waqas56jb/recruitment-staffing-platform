import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import OptimizedImage from '../ui/OptimizedImage'
import { useI18n } from '../../i18n'

export default function IndustryCard({ industry }) {
  const { t } = useI18n()
  return (
    <Link
      to={`/industries#${industry.id}`}
      className="card-shell card-interactive group block overflow-hidden"
    >
      <OptimizedImage
        src={industry.image.src}
        alt={industry.image.alt}
        className="aspect-[16/10]"
        imgClassName="transition duration-500 group-hover:scale-[1.03]"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
      />
      <div className="p-4 sm:p-5">
        <h3 className="text-lg font-semibold leading-snug">{t(industry.title)}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {t(industry.summary)}
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
          {t('Explore')}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
