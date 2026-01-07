import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Props = {
    isOpen: boolean
    email: string
    onComplete: (name: string, phone: string) => void
}

export function OnboardingModal({ isOpen, email, onComplete }: Props) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Validation logic similar to BookingForm
    const validateForm = (sanitizedPhone: string) => {
        const trimmedName = name.trim()
        if (trimmedName.length > 0 && trimmedName.length < 3) {
            setError('Name is too short (min 3 chars)')
            return false
        }

        if (sanitizedPhone.length > 0) {
            if (!/^[6-9]/.test(sanitizedPhone)) {
                setError('Phone must start with 6, 7, 8, or 9')
                return false
            }
            if (sanitizedPhone.length !== 10) {
                setError('Phone must be exactly 10 digits')
                return false
            }
        } else {
            setError('Please enter a valid phone number')
            return false
        }

        setError(null)
        return true
    }

    const getSanitizedPhone = (input: string) => {
        let val = input.replace(/\D/g, '')
        if (val.startsWith('91') && val.length > 10) {
            val = val.substring(2)
        } else if (val.startsWith('0')) {
            val = val.substring(1)
        }
        return val
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const sanitized = getSanitizedPhone(phone)

        if (!validateForm(sanitized)) return

        setLoading(true)
        setError(null)

        try {
            // Update authorized_users table
            const { error: updateError } = await supabase
                .from('authorized_users')
                .update({
                    name: name.trim(),
                    phone: sanitized
                })
                .eq('email', email)

            if (updateError) throw updateError

            onComplete(name.trim(), sanitized)

        } catch (err: any) {
            console.error('Onboarding error:', err)
            setError(err.message || 'Failed to save profile')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop - Non-dismissible */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

            {/* Modal */}
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border border-slate-100">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome!</h2>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        Please provide your details for further communication and slot bookings.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="onboard-name" className="block text-sm font-bold text-slate-700 mb-2">
                            Your Name
                        </label>
                        <input
                            id="onboard-name"
                            type="text"
                            required
                            autoFocus
                            className={`input-field ${error && name.trim().length > 0 && name.trim().length < 3 ? 'border-red-500' : ''}`}
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                                if (error) setError(null)
                            }}
                        />
                    </div>

                    <div>
                        <label htmlFor="onboard-phone" className="block text-sm font-bold text-slate-700 mb-2">
                            Phone Number
                        </label>
                        <input
                            id="onboard-phone"
                            type="tel"
                            required
                            className={`input-field ${error && phone.length > 0 ? 'border-red-500' : ''}`}
                            placeholder="10-digit mobile number"
                            value={phone}
                            inputMode="numeric"
                            onChange={(e) => {
                                setPhone(e.target.value)
                                if (error) setError(null)
                            }}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-[11px] font-bold px-4 py-2 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                        {loading ? 'Saving...' : 'Get Started'}
                    </button>
                </form>
            </div>
        </div>
    )
}
