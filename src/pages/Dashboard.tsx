import { useState } from 'react'
import { useSlots } from '../hooks/useSlots'
import { useBooking } from '../hooks/useBooking'
import { SlotList } from '../components/SlotList'
import Loader from '../components/Loader'
import { BookingForm } from '../components/BookingForm'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
    const { slots, loading: slotsLoading, error: slotsError, refetch } = useSlots()
    const { bookSlot, loading: bookingLoading, error: bookingError } = useBooking()
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleBook = async (name: string) => {
        if (!selectedSlotId) return

        const ok = await bookSlot(selectedSlotId, name)
        if (ok) {
            setSuccess(true)
            setSelectedSlotId(null)
            refetch()
            setTimeout(() => setSuccess(false), 3000)
        }
    }

    const handleLogout = () => supabase.auth.signOut()

    return (
        <div className="min-h-screen bg-white">
            <header className="max-w-4xl mx-auto px-4 py-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 font-medium">Available booking slots</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                >
                    Sign out
                </button>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {selectedSlotId ? (
                    <div className="max-w-md mx-auto bg-white/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Complete Booking</h2>
                        <BookingForm
                            onSubmit={handleBook}
                            onCancel={() => setSelectedSlotId(null)}
                            loading={bookingLoading}
                        />
                        {bookingError && (
                            <p className="mt-4 text-sm font-bold text-red-600 text-center">{bookingError}</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {success && (
                            <div className="bg-green-50 text-green-600 font-bold p-4 rounded-2xl text-center border border-green-100 flex items-center justify-center gap-2">
                                <span className="text-lg">✨</span> Booking confirmed!
                            </div>
                        )}

                        {slotsError && (
                            <div className="bg-red-50 text-red-600 font-bold p-4 rounded-2xl text-center border border-red-100">
                                {slotsError}
                            </div>
                        )}

                        {slotsLoading ? (
                            <Loader />
                        ) : (
                            <SlotList
                                slots={slots}
                                onBook={(id) => setSelectedSlotId(id)}
                            />
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
