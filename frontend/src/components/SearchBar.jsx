export default function SearchBar({ value, onChange, placeholder = 'Cari nama, jenis, atau lokasi barang...' }) {
  return (
    <div className="relative">
      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-soft pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 114 10.5a6.5 6.5 0 0113 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-surface text-text placeholder:text-text-soft/70
                   py-3.5 pl-12 pr-4 text-[15px] outline-none transition
                   focus:ring-2 focus:ring-forest/25 focus:border-forest"
      />
    </div>
  )
}
