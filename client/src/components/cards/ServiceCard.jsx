import {
  CalendarCheck,
  Clock3,
  FileSignature,
  FolderKanban,
  Network,
  Receipt,
  ScrollText,
  SearchCheck,
  UserCheck,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'

const icons = {
  UserCheck,
  Clock3,
  FileSignature,
  SearchCheck,
  Network,
  FolderKanban,
  Wallet,
  CalendarCheck,
  ScrollText,
  Receipt,
}

export default function ServiceCard({ service, index = 0, compact = false }) {
  const { t } = useI18n()
  const Icon = icons[service.icon] || UserCheck
  const numbered = String(index + 1).padStart(2, '0')

  return (
    <Link
      to={`/services#${service.id}`}
      className="card-shell card-interactive group flex h-full flex-col p-5 sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted">{numbered}</span>
        <span className="rounded-md bg-cream p-2 text-ink">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>

      <h3 className="text-lg font-semibold leading-snug sm:text-xl">{t(service.title)}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {t(compact ? service.short : service.description)}
      </p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-accent transition group-hover:gap-1.5">
        {t('Learn more')}
        <span aria-hidden>→</span>
      </span>
    </Link>
  )
}
