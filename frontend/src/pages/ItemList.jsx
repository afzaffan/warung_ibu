import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useItems, defaultPrice } from '../hooks/useItems'
import SearchBar from '../components/SearchBar'
import ItemCard from '../components/ItemCard'
import { supabase } from '../lib/supabaseClient'

export default function ItemList() {
  const { items, loading, reload } = useItems()
  const [q, setQ] = useState('')
  const [params] = useSearchParams()
  const onlyBelumHarga = params.get('filter') === 'belum-harga'
  const [locationFilter, setLocationFilter] = useState('semua')

  const locations = useMemo(
    () => Array.from(new Set(items.map((i) => i.location?.name).filter(Boolean))),
    [items]
  )

  const filtered = useMemo(() => {
    const term = q.toLowerCase()
    return items.filter((i) => {
      if (onlyBelumHarga && defaultPrice(i)) return false
      if (locationFilter !== 'semua' && i.location?.name !== locationFilter) return false
      if (!term) return true
      return (
        i.name.toLowerCase().includes(term) ||
        i.category?.name?.toLowerCase().includes(term) ||
        i.location?.name?.toLowerCase().includes(term)
      )
    })
  }, [items, q, locationFilter, onlyBelumHarga])

  async function toggleStatus(item) {
    const next = item.status === 'habis' ? 'tersedia' : 'habis'
    await supabase.from('items').update({ status: next }).eq('id', item.id)
    reload()
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-bold text-text">Daftar Barang</h1>

      <SearchBar value={q} onChange={setQ} />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <FilterChip active={locationFilter === 'semua'} onClick={() => setLocationFilter('semua')}>
          Semua Lokasi
        </FilterChip>
        {locations.map((loc) => (
          <FilterChip key={loc} active={locationFilter === loc} onClick={() => setLocationFilter(loc)}>
            {loc}
          </FilterChip>
        ))}
      </div>

      {onlyBelumHarga && (
        <p className="text-xs text-text-soft -mt-2">Menampilkan hanya barang yang belum punya harga pasti.</p>
      )}

      {loading ? (
        <p className="text-sm text-text-soft">Memuat data...</p>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-text-soft">{filtered.length} barang</p>
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} onToggleStatus={toggleStatus} />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-text-soft py-10 text-center">Tidak ada barang yang cocok.</p>
          )}
        </div>
      )}
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium border transition ' +
        (active
          ? 'bg-forest text-white border-forest'
          : 'border-border text-text-soft hover:border-forest/40 hover:text-text')
      }
    >
      {children}
    </button>
  )
}
