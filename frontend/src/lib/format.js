export function formatRupiah(value) {
  if (value === null || value === undefined) return '—'
  return 'Rp' + Number(value).toLocaleString('id-ID')
}
