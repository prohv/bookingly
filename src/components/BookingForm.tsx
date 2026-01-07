import { useState } from 'react'

type Props = {
    onSubmit: (name: string, phone: string) => void
    onCancel: () => void
    loading?: boolean
}

export function BookingForm({ onSubmit, onCancel, loading }: Props) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [formError, setFormError] = useState<string | null>(null)

    const validateForm = (sanitizedPhone: string) => {
        const trimmedName = name.trim()
        if (trimmedName.length > 0 && trimmedName.length < 3) {
            setFormError('Name is too short (min 3 chars)')
            return false
        }

        if (sanitizedPhone.length > 0) {
            if (!/^[6-9]/.test(sanitizedPhone)) {
                setFormError('Phone must start with 6, 7, 8, or 9')
                return false
            }
            if (sanitizedPhone.length !== 10) {
                setFormError('Phone must be exactly 10 digits')
                return false
            }
        } else if (phone.length > 0) {
            setFormError('Please enter a valid phone number')
            return false
        }

        setFormError(null)
        return true
    }

    const getSanitizedPhone = (input: string) => {
        let val = input.replace(/\D/g, '') // Strip all non-digits

        // Prefix Wipeout: Remove leading 91 (from +91) or 0
        if (val.startsWith('91') && val.length > 10) {
            val = val.substring(2)
        } else if (val.startsWith('0')) {
            val = val.substring(1)
        }
        return val
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value)
        if (formError) setFormError(null)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const sanitized = getSanitizedPhone(phone)
        if (validateForm(sanitized)) {
            onSubmit(name.trim(), sanitized)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
                    Your Name
                </label>
                <input
                    id="name"
                    type="text"
                    required
                    autoFocus
                    className={`input-field ${formError && name.trim().length > 0 && name.trim().length < 3 ? 'border-red-500' : ''}`}
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                        if (formError) setFormError(null)
                    }}
                />
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-2">
                    Phone Number
                </label>
                <input
                    id="phone"
                    type="tel"
                    required
                    className={`input-field ${formError && phone.length > 0 && (phone.length !== 10 || !/^[6-9]/.test(phone)) ? 'border-red-500' : ''}`}
                    placeholder="10-digit mobile number"
                    value={phone}
                    inputMode="numeric"
                    onChange={handlePhoneChange}
                />
            </div>

            {formError && (
                <div className="bg-red-50 text-red-600 text-[11px] font-bold px-4 py-2 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    {formError}
                </div>
            )}

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="glass-button flex-1 border-slate-200"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="glass-button flex-1 bg-slate-900 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {loading ? 'Booking...' : 'Confirm'}
                </button>
            </div>
        </form>
    )
}
