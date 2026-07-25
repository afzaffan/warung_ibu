import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { formatRupiah } from '../lib/format'
import StatusBadge from '../components/StatusBadge'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function load() {
    const { data } = await supabase
      .from('items')
      .select(`
        id, name, status, note,
        location:locations ( name ),
        category:categories ( name ),
        item_prices ( id, unit_label, unit_quantity, price, is_default )
      `)
      .eq('id', id)
      .single()
    setItem(data)
  }

  useEffect(() => {
    load()
  }, [id])

  async function toggleStatus() {
    const next = item.status === 'habis' ? 'tersedia' : 'habis'
    await supabase.from('items').update({ status: next }).eq('id', item.id)
    load()
  }

  async function handleDelete() {
    await supabase.from('items').delete().eq('id', item.id)
    navigate('/barang')
  }

  if (!item) return <p className="text-sm text-ink-soft">Memuat...</p>

  const prices = [...(item.item_prices ?? [])].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate(-1)} className="text-sm text-ink-soft w-fit">← Kembali</button>

      <div className="rounded-2xl border border-line dark:border-[#2C332A] bg-white dark:bg-[#1D231C] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold">{item.name}</h1>
            <p className="text-sm text-ink-soft mt-1">
              {item.location?.name ?? 'Tanpa lokasi'}
              {item.category?.name ? ` · ${item.category.name}` : ''}
            </p>
          </div>
          <StatusBadge status={item.status} onClick={toggleStatus} />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <p className="text-xs font-medium text-ink-soft uppercase tracking-wide">Harga</p>
          {prices.length === 0 && (
            <p className="text-sm rounded-xl bg-mustard-soft dark:bg-[#3A331B] text-forest dark:text-mustard px-3 py-2">
              Belum ada harga — silakan lengkapi lewat tombol Edit.
            </p>
          )}
          {prices.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-line dark:border-[#2C332A] px-3 py-2.5">
              <span className="text-sm">
                {p.unit_label} {p.unit_quantity > 1 ? `(${p.unit_quantity})` : ''}
                {p.is_default && <span className="ml-2 text-[10px] text-forest dark:text-mustard">utama</span>}
              </span>
              <span className="price-tag text-sm">{formatRupiah(p.price)}</span>
            </div>
          ))}
        </div>

        {item.note && (
          <div className="mt-5">
            <p className="text-xs font-medium text-ink-soft uppercase tracking-wide">Catatan</p>
            <p className="text-sm mt-1">{item.note}</p>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <Link
            to={`/edit/${item.id}`}
            className="flex-1 text-center rounded-xl bg-forest text-white text-sm font-medium py-2.5"
          >
            Edit
          </Link>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex-1 rounded-xl border border-brick text-brick text-sm font-medium py-2.5"
          >
            Hapus
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1D231C] rounded-2xl p-5 w-full max-w-sm">
            <p className="font-display font-semibold">Hapus "{item.name}"?</p>
            <p className="text-sm text-ink-soft mt-1">Tindakan ini tidak bisa dibatalkan.</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-xl border border-line dark:border-[#2C332A] py-2.5 text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-brick text-white py-2.5 text-sm font-medium"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
