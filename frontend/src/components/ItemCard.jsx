import { Link } from 'react-router-dom'
import { formatRupiah } from '../lib/format'
import { defaultPrice } from '../hooks/useItems'
import StatusBadge from './StatusBadge'

export default function ItemCard({ item, onToggleStatus }) {
  const price = defaultPrice(item)

  return (
    <Link
      to={`/barang/${item.id}`}
      className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white
                 dark:bg-[#1D231C] dark:border-[#2C332A] px-4 py-3.5 transition hover:shadow-sm hover:border-forest/40"
    >
      <div className="min-w-0">
        <p className="font-display font-semibold text-[15px] truncate">{item.name}</p>
        <p className="text-xs text-ink-soft mt-0.5 truncate">
          {item.location?.name ?? 'Tanpa lokasi'}
          {item.category?.name ? ` · ${item.category.name}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {price ? (
          <span className="price-tag text-sm">
            {formatRupiah(price.price)}
            <span className="text-[10px] font-normal opacity-70">/{price.unit_label}</span>
          </span>
        ) : (
          <span className="text-xs rounded-full px-3 py-1 bg-mustard-soft text-forest dark:bg-[#3A331B] dark:text-mustard">
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
