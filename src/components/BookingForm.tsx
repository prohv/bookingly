import { useState } from 'react'

type Props = {
    onSubmit: (name: string, phone: string) => void
    onCancel: () => void
    loading?: boolean
}

export function BookingForm({ onSubmit, onCancel, loading }: Props) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim() && phone.trim()) {
            (onSubmit as any)(name, phone)
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
                    className="input-field"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    className="input-field"
                    placeholder="e.g. +1 234 567 8900"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>

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
                    disabled={loading || !name.trim() || !phone.trim()}
                    className="glass-button flex-1 bg-slate-900 text-white disabled:opacity-50"
                >
                    {loading ? 'Booking...' : 'Confirm'}
                </button>
            </div>
        </form>
    )
}
