import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const emptyPriceRow = () => ({ unit_label: 'pcs', unit_quantity: 1, price: '', is_default: false, id: null })

export default function ItemForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [locationId, setLocationId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [prices, setPrices] = useState([{ ...emptyPriceRow(), is_default: true }])
  const [locations, setLocations] = useState([])
  const [categories, setCategories] = useState([])
  const [newLocation, setNewLocation] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadOptions()
    if (isEdit) loadItem()
  }, [id])

  async function loadOptions() {
    const [{ data: locs }, { data: cats }] = await Promise.all([
      supabase.from('locations').select('id, name').order('name'),
      supabase.from('categories').select('id, name').order('name'),
    ])
    setLocations(locs ?? [])
    setCategories(cats ?? [])
  }

  async function loadItem() {
    const { data } = await supabase
      .from('items')
      .select('name, note, location_id, category_id, item_prices ( id, unit_label, unit_quantity, price, is_default )')
      .eq('id', id)
      .single()
    if (!data) return
    setName(data.name)
    setNote(data.note ?? '')
    setLocationId(data.location_id ?? '')
    setCategoryId(data.category_id ?? '')
    setPrices(data.item_prices?.length ? data.item_prices : [{ ...emptyPriceRow(), is_default: true }])
  }

  async function addLocation() {
    if (!newLocation.trim()) return
    const { data, error } = await supabase.from('locations').insert({ name: newLocation.trim() }).select().single()
    if (!error && data) {
      setLocations((l) => [...l, data])
      setLocationId(data.id)
      setNewLocation('')
    }
  }

  function updatePriceRow(idx, patch) {
    setPrices((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  function setDefaultRow(idx) {
    setPrices((rows) => rows.map((r, i) => ({ ...r, is_default: i === idx })))
  }

  function removeRow(idx) {
    setPrices((rows) => rows.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    const validPrices = prices.filter((p) => p.price !== '' && p.price !== null && p.price !== undefined)

    try {
      let itemId = id
      if (isEdit) {
        const { error: updateErr } = await supabase
          .from('items')
          .update({ name, note: note || null, location_id: locationId || null, category_id: categoryId || null })
          .eq('id', id)
        if (updateErr) throw new Error('Gagal menyimpan data barang: ' + updateErr.message)

        const { error: deleteErr } = await supabase.from('item_prices').delete().eq('item_id', id)
        if (deleteErr) throw new Error('Gagal menghapus harga lama: ' + deleteErr.message)
      } else {
        const { data, error } = await supabase
          .from('items')
          .insert({ name, note: note || null, location_id: locationId || null, category_id: categoryId || null })
          .select()
          .single()
        if (error) throw new Error('Gagal menyimpan: ' + error.message)
        itemId = data.id
      }

      if (validPrices.length > 0) {
        const rows = validPrices.map((p) => ({
          item_id: itemId,
          unit_label: (p.unit_label || 'pcs').trim(),
          unit_quantity: Number(p.unit_quantity) > 0 ? Number(p.unit_quantity) : 1,
          price: Number(p.price),
          is_default: Boolean(p.is_default),
        }))
        // pastikan tepat satu default (kalau tidak ada yang dicentang, jadikan baris pertama default)
        if (!rows.some((r) => r.is_default)) rows[0].is_default = true
        // kalau lebih dari satu tercentang default (seharusnya tidak mungkin dari UI, tapi jaga-jaga),
        // sisakan hanya yang pertama supaya tidak bentrok dengan unique constraint di database
        let defaultSeen = false
        for (const r of rows) {
          if (r.is_default) {
            if (defaultSeen) r.is_default = false
            else defaultSeen = true
          }
        }

        const { error: insertErr } = await supabase.from('item_prices').insert(rows)
        if (insertErr) throw new Error('Gagal menyimpan harga: ' + insertErr.message)
      }

      navigate(isEdit ? `/barang/${itemId}` : '/barang')
    } catch (err) {
      alert(err.message || 'Terjadi kesalahan saat menyimpan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-8">
      <h1 className="font-display text-2xl font-bold text-text">{isEdit ? 'Edit Barang' : 'Tambah Barang'}</h1>

      <Field label="Nama Barang">
        <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
      </Field>

      <Field label="Lokasi">
        <div className="flex gap-2">
          <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="input flex-1">
            <option value="">Pilih lokasi</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mt-2">
          <input
            placeholder="+ lokasi baru"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="input flex-1 text-sm"
          />
          <button type="button" onClick={addLocation} className="px-3 rounded-xl border border-border text-sm text-text hover:bg-surface-alt">
            Tambah
          </button>
        </div>
      </Field>

      <Field label="Jenis / Kategori (opsional)">
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
          <option value="">Belum dikategorikan</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-text">Harga</p>
          <button
            type="button"
            onClick={() => setPrices((r) => [...r, emptyPriceRow()])}
            className="text-xs text-accent font-medium"
          >
            + Tambah satuan harga
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {prices.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_70px_1fr_auto] gap-2 items-center rounded-xl border border-border p-2.5">
              <input
                placeholder="satuan (pcs/renceng/dus)"
                value={row.unit_label}
                onChange={(e) => updatePriceRow(idx, { unit_label: e.target.value })}
                className="input text-sm py-2"
              />
              <input
                type="number" min="1" placeholder="qty"
                value={row.unit_quantity}
                onChange={(e) => updatePriceRow(idx, { unit_quantity: Number(e.target.value) })}
                className="input text-sm py-2"
              />
              <input
                type="number" min="0" placeholder="harga (Rp)"
                value={row.price}
                onChange={(e) => updatePriceRow(idx, { price: e.target.value })}
                className="input text-sm py-2"
              />
              <div className="flex items-center gap-1">
                <label className="flex items-center gap-1 text-[10px] text-text-soft">
                  <input type="radio" checked={row.is_default} onChange={() => setDefaultRow(idx)} />
                  utama
                </label>
                {prices.length > 1 && (
                  <button type="button" onClick={() => removeRow(idx)} className="text-brick text-xs px-1">✕</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-soft mt-2">
          Boleh dikosongkan sementara kalau belum tahu harganya — nanti akan ditandai "Belum ada harga" dan wajib dilengkapi.
        </p>
      </div>

      <Field label="Catatan (opsional)">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} className="input" rows={3} />
      </Field>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-forest text-white font-medium py-3 disabled:opacity-60"
      >
        {saving ? 'Menyimpan...' : 'Simpan'}
      </button>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          padding: 0.75rem 0.9rem;
          background: var(--color-surface);
          color: var(--color-text);
          outline: none;
          transition: border-color 0.15s ease;
        }
        .input::placeholder { color: var(--color-text-soft); opacity: 0.7; }
        .input:focus { border-color: var(--color-forest); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-forest) 15%, transparent); }
      `}</style>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text">{label}</span>
      {children}
    </label>
  )
}
