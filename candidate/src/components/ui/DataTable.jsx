import EmptyState from './EmptyState'
import { useI18n } from '../../i18n'

export default function DataTable({ columns, rows, rowKey = 'id', emptyTitle = 'No records', emptyDescription }) {
  const { t } = useI18n()
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} />
  return (
    <div className="table-wrap">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-cream text-xs font-medium text-muted">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">{typeof col.label === 'string' ? t(col.label) : col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-t border-line hover:bg-cream">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-top">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
