import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <div className="text-center mb-2">
          <p className="font-display text-xl font-bold text-forest dark:text-mustard">Warung Ibu</p>
          <p className="text-sm text-ink-soft mt-1">Masuk untuk mengelola katalog harga.</p>
        </div>

        <input
          type="email" required placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-line dark:border-[#2C332A] dark:bg-[#1D231C] px-4 py-3 outline-none focus:border-forest"
        />
        <input
          type="password" required placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-line dark:border-[#2C332A] dark:bg-[#1D231C] px-4 py-3 outline-none focus:border-forest"
        />

        {error && <p className="text-sm text-brick">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="rounded-xl bg-forest text-white font-medium py-3 disabled:opacity-60"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>

        <p className="text-xs text-ink-soft text-center mt-2">
          Akun dibuat lewat Supabase Dashboard → Authentication → Users (bukan self-register).
        </p>
      </form>
    </div>
  )
}
