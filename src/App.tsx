import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import { Session } from '@supabase/supabase-js'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<'admin' | 'participant' | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'dashboard' | 'admin'>('dashboard')

  useEffect(() => {
    async function fetchRole(email: string) {
      const { data, error } = await supabase
        .from('authorized_users')
        .select('role')
        .eq('email', email.toLowerCase())
        .single()

      if (error) {
        console.error('Role fetch error:', error.message)
      }
      setRole(data?.role || null)
    }

    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false) // Unblock the UI immediately after getting the session

      if (session?.user?.email) {
        fetchRole(session.user.email)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user?.email) {
        fetchRole(session.user.email)
      } else {
        setRole(null)
        setView('dashboard')
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
      {view === 'admin' && role === 'admin' ? (
        <Admin onBack={() => setView('dashboard')} />
      ) : (
        <Dashboard
          isAdmin={role === 'admin'}
          onViewAdmin={() => setView('admin')}
        />
      )}
    </div>
  )
}
