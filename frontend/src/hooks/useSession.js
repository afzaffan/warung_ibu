import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useSession() {
  const [session, setSession] = useState(undefined) // undefined = belum tahu, null = belum login

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return session
}
