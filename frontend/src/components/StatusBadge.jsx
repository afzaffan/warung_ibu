export default function StatusBadge({ status, onClick }) {
  const isHabis = status === 'habis'
  return (
    <button
      onClick={onClick}
      title="Klik untuk ubah status"
      className={
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ' +
        (isHabis
          ? 'bg-brick/10 text-brick hover:bg-brick/20'
          : 'bg-forest/10 text-forest hover:bg-forest/20')
      }
    >
      <span className={'w-1.5 h-1.5 rounded-full ' + (isHabis ? 'bg-brick' : 'bg-forest')} />
      {isHabis ? 'Habis' : 'Tersedia'}
    </button>
  )
}
