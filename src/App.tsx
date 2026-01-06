import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { Session } from '@supabase/supabase-js'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<'admin' | 'participant' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      if (session?.user?.email) {
        const { data } = await supabase
          .from('authorized_users')
          .select('role')
          .eq('email', session.user.email.toLowerCase())
          .single()
        setRole(data?.role || null)
      }
      setLoading(false)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user?.email) {
        const { data } = await supabase
          .from('authorized_users')
          .select('role')
          .eq('email', session.user.email.toLowerCase())
          .single()
        setRole(data?.role || null)
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Dashboard isAdmin={role === 'admin'} />
    </div>
  )
}
