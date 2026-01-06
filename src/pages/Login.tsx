import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        })

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: 'Check your email for the magic link!' })
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="blue-spread" />

            <div className="max-w-md w-full space-y-8 bg-white/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl relative z-10">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
                        Bookingly
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Sign in to manage your bookings
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email-address" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="input-field"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {message && (
                        <div className={`text-sm font-bold text-center p-3 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-button w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Magic Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
