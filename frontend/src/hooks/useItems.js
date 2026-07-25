import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Ambil semua item beserta lokasi, kategori, dan seluruh baris harga (bukan cuma default),
// supaya search & filter bisa jalan di sisi client dengan cepat tanpa banyak query.
export function useItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
  const { data, error } = await supabase
      .from('items')
      .select(`
        id, name, status, note, created_at,
        location:locations ( id, name ),
        item_prices ( id, unit_label, unit_quantity, price, is_default ),
        item_categories ( category:categories ( id, name ) )
      `)
      .order('name', { ascending: true })

    if (error) {
      setError(error.message)
      setItems([])
    } else {
      setItems(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { items, loading, error, reload }
}

export function defaultPrice(item) {
  return item.item_prices?.find((p) => p.is_default) ?? item.item_prices?.[0] ?? null
}
