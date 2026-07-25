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
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 border-r border-border px-6 py-7">
        <div className="mb-10">
          <p className="font-display text-xl font-bold text-accent">Warung Ibu</p>
          <p className="text-xs text-text-soft mt-0.5">Katalog harga barang</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ' +
                (isActive
                  ? 'bg-forest text-white shadow-sm'
                  : 'text-text-soft hover:bg-forest/8 hover:text-text')
              }
            >
              <span className="w-4 text-center text-[15px]">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-border">
          <button
            onClick={() => setDark((d) => !d)}
            className="flex items-center gap-2 text-xs text-text-soft hover:text-text py-2 text-left"
          >
            <span>{dark ? '☀' : '●'}</span> {dark ? 'Mode terang' : 'Mode gelap'}
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 text-xs text-text-soft hover:text-brick py-2 text-left"
          >
            <span>⎋</span> Keluar
          </button>
        </div>
      </aside>

      {/* Topbar - mobile */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface-alt/95 backdrop-blur z-10">
        <div>
          <p className="font-display text-lg font-bold text-accent leading-tight">Warung Ibu</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setDark((d) => !d)} className="text-base text-text-soft">
            {dark ? '☀' : '●'}
          </button>
          <button onClick={() => supabase.auth.signOut()} className="text-base text-text-soft">⎋</button>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 md:px-10 md:py-10 pb-28 md:pb-10 max-w-3xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Bottom nav - mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border
                       bg-surface/95 backdrop-blur flex justify-around py-2 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              'flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-[11px] font-medium transition ' +
              (isActive ? 'text-accent' : 'text-text-soft')
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
