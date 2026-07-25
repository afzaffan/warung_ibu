import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '⌂' },
  { to: '/barang', label: 'Daftar Barang', icon: '☰' },
  { to: '/tambah', label: 'Tambah', icon: '+' },
  { to: '/habis', label: 'Barang Habis', icon: '⚠' },
]

export default function AppShell() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 border-r border-line dark:border-[#2C332A] p-5">
        <div className="mb-8">
          <p className="font-display text-lg font-bold text-forest dark:text-mustard">Warung Ibu</p>
          <p className="text-xs text-ink-soft">Katalog harga barang</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ' +
                (isActive
                  ? 'bg-forest text-white'
                  : 'text-ink-soft hover:bg-forest/10 hover:text-forest')
              }
            >
              <span className="w-4 text-center">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={() => setDark((d) => !d)}
            className="text-xs text-ink-soft hover:text-forest text-left"
          >
            {dark ? '☀ Mode terang' : '● Mode gelap'}
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-ink-soft hover:text-brick text-left"
          >
            ⎋ Keluar
          </button>
        </div>
      </aside>

      {/* Topbar - mobile */}
      <header className="md:hidden flex items-center justify-between px-4 py-4 border-b border-line dark:border-[#2C332A]">
        <p className="font-display text-lg font-bold text-forest dark:text-mustard">Warung Ibu</p>
        <div className="flex items-center gap-3">
          <button onClick={() => setDark((d) => !d)} className="text-sm text-ink-soft">
            {dark ? '☀' : '●'}
          </button>
          <button onClick={() => supabase.auth.signOut()} className="text-sm text-ink-soft">⎋</button>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 md:px-8 md:py-8 pb-24 md:pb-8 max-w-4xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Bottom nav - mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-line dark:border-[#2C332A]
                       bg-white/95 dark:bg-[#141812]/95 backdrop-blur flex justify-around py-2">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-medium ' +
              (isActive ? 'text-forest dark:text-mustard' : 'text-ink-soft')
            }
          >
            <span className="text-base leading-none">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
