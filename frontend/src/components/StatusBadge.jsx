export default function StatusBadge({ status, onClick }) {
  const isHabis = status === 'habis'
  return (
    <button
      onClick={onClick}
      title="Klik untuk ubah status"
      className={
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition shrink-0 border ' +
        (isHabis
          ? 'bg-brick-soft text-brick border-brick/20 hover:brightness-95'
          : 'bg-forest-soft text-accent border-transparent hover:brightness-95')
      }
    >
      <span className={'w-1.5 h-1.5 rounded-full ' + (isHabis ? 'bg-brick' : 'bg-forest')} />
      {isHabis ? 'Habis' : 'Tersedia'}
    </button>
  )
}
