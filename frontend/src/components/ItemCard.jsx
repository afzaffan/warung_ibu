import { Link } from 'react-router-dom'
import { formatRupiah } from '../lib/format'
import { defaultPrice } from '../hooks/useItems'
import StatusBadge from './StatusBadge'

export default function ItemCard({ item, onToggleStatus }) {
  const price = defaultPrice(item)

  return (
    <Link
      to={`/barang/${item.id}`}
      className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface
                 px-4 py-4 transition hover:shadow-md hover:border-forest/30 hover:-translate-y-px"
    >
      <div className="min-w-0">
        <p className="font-display font-semibold text-[15px] text-text truncate">{item.name}</p>
        <p className="text-xs text-text-soft mt-1 truncate">
          {item.location?.name ?? 'Tanpa lokasi'}
          {item.category?.name ? ` · ${item.category.name}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {price ? (
          <span className="price-tag text-sm">
            {formatRupiah(price.price)}
            <span className="text-[10px] font-normal opacity-70">/{price.unit_label}</span>
          </span>
        ) : (
          <span className="text-xs rounded-full px-3 py-1.5 bg-mustard-soft text-accent font-medium whitespace-nowrap">
            Belum ada harga
          </span>
        )}
        <StatusBadge
          status={item.status}
          onClick={(e) => {
            e.preventDefault()
            onToggleStatus(item)
          }}
        />
      </div>
    </Link>
  )
}
