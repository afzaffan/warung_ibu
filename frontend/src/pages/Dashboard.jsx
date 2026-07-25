import { useMemo, useState } from 'react'
import { useItems, defaultPrice } from '../hooks/useItems'
import SearchBar from '../components/SearchBar'
import ItemCard from '../components/ItemCard'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { items, loading, reload } = useItems()
  const [q, setQ] = useState('')

  const stats = useMemo(() => {
    const habis = items.filter((i) => i.status === 'habis').length
    const categories = new Set(items.map((i) => i.category?.name).filter(Boolean)).size
    const locations = new Set(items.map((i) => i.location?.name).filter(Boolean)).size
    const belumHarga = items.filter((i) => !defaultPrice(i)).length
    return { total: items.length, habis, categories, locations, belumHarga }
  }, [items])

  const results = useMemo(() => {
    if (!q.trim()) return []
    const term = q.toLowerCase()
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(term) ||
        i.category?.name?.toLowerCase().includes(term) ||
        i.location?.name?.toLowerCase().includes(term)
    )
  }, [items, q])

  async function toggleStatus(item) {
    const next = item.status === 'habis' ? 'tersedia' : 'habis'
    await supabase.from('items').update({ status: next }).eq('id', item.id)
    reload()
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-sm text-text-soft mt-1.5">Ringkasan katalog warung Ibu.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Barang" value={stats.total} />
        <StatCard label="Barang Habis" value={stats.habis} accent="brick" />
        <StatCard label="Kategori" value={stats.categories} />
        <StatCard label="Lokasi" value={stats.locations} />
      </div>

      {stats.belumHarga > 0 && (
        <Link
          to="/barang?filter=belum-harga"
          className="rounded-2xl border border-mustard/30 bg-mustard-soft px-4 py-3.5 text-sm
                     text-accent flex items-center justify-between gap-3"
        >
          <span>{stats.belumHarga} barang belum punya harga pasti — perlu diisi manual.</span>
          <span className="font-semibold whitespace-nowrap">Lihat →</span>
        </Link>
      )}

      <div className="flex flex-col gap-3">
        <SearchBar value={q} onChange={setQ} />

        {loading && <p className="text-sm text-text-soft">Memuat data...</p>}

        {q.trim() && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-text-soft">{results.length} hasil ditemukan</p>
            {results.map((item) => (
              <ItemCard key={item.id} item={item} onToggleStatus={toggleStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, accent = 'forest' }) {
  const color = accent === 'brick' ? 'text-brick' : 'text-accent'
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-text-soft mt-1.5">{label}</p>
    </div>
  )
}
