import { useI18n } from '../../i18n'

export default function ProcessStep({ step }) {
  const { t } = useI18n()
  return (
    <div className="card-shell h-full p-5 sm:p-6">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-sm font-semibold text-accent">
        {step.step}
      </span>
      <h3 className="mt-4 text-base font-semibold sm:text-lg">{t(step.title)}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t(step.description)}</p>
    </div>
  )
}
