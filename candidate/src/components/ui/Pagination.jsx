import Button from './Button'

export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
      <p>Page {page} of {pages} · {total} items</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</Button>
      </div>
    </div>
  )
}
