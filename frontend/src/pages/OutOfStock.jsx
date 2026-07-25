import { useMemo } from 'react'
import { useItems } from '../hooks/useItems'
import ItemCard from '../components/ItemCard'
import { supabase } from '../lib/supabaseClient'

export default function OutOfStock() {
  const { items, loading, reload } = useItems()
  const habis = useMemo(() => items.filter((i) => i.status === 'habis'), [items])

  async function toggleStatus(item) {
    await supabase.from('items').update({ status: 'tersedia' }).eq('id', item.id)
    reload()
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Barang Habis</h1>
        <p className="text-sm text-text-soft mt-1.5">{habis.length} barang sedang habis. Tetap bisa dicari dari halaman lain.</p>
      </div>

      {loading ? (
        <p className="text-sm text-text-soft">Memuat data...</p>
      ) : habis.length === 0 ? (
        <p className="text-sm text-text-soft py-10 text-center">Tidak ada barang yang habis 🎉</p>
      ) : (
        <div className="flex flex-col gap-2">
          {habis.map((item) => (
            <ItemCard key={item.id} item={item} onToggleStatus={toggleStatus} />
          ))}
        </div>
      )}
    </div>
  )
}
