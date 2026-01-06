import { useState } from 'react'

type Props = {
    onSubmit: (name: string) => void
    onCancel: () => void
    loading?: boolean
}

export function BookingForm({ onSubmit, onCancel, loading }: Props) {
    const [name, setName] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onSubmit(name)
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
                    disabled={loading || !name.trim()}
                    className="glass-button flex-1 bg-slate-900 text-white disabled:opacity-50"
                >
                    {loading ? 'Booking...' : 'Confirm'}
                </button>
            </div>
        </form>
    )
}
