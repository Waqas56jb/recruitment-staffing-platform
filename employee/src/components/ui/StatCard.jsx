import Card from './Card'
export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</p>
          {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
        </div>
        {Icon ? <span className="rounded-md bg-cream p-2 text-ink"><Icon className="h-5 w-5" /></span> : null}
      </div>
    </Card>
  )
}
