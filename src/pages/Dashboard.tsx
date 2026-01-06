import { useState } from 'react'
import { useSlots } from '../hooks/useSlots'
import { useBooking } from '../hooks/useBooking'
import { useUserBookings } from '../hooks/useUserBookings'
import { SlotList } from '../components/SlotList'
import Loader from '../components/Loader'
import { BookingForm } from '../components/BookingForm'
import { MyBookingCard } from '../components/MyBookingCard'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { supabase } from '../lib/supabase'

export default function Dashboard({ isAdmin, onViewAdmin }: { isAdmin?: boolean, onViewAdmin?: () => void }) {
    const { slots, loading: slotsLoading, error: slotsError, refetch } = useSlots()
    const { bookSlot, cancelBooking, loading: actionLoading, error: bookingError } = useBooking()
    const { booking, loading: userBookingLoading, refetch: refetchUserBooking } = useUserBookings()

    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)

    const handleBook = async (name: string, phone: string) => {
        if (!selectedSlotId) return

        const ok = await bookSlot(selectedSlotId, name, phone)
        if (ok) {
            setSelectedSlotId(null)
            refetch()
            refetchUserBooking()
        }
    }

    const openCancelModal = (bookingId: string) => {
        setBookingToCancel(bookingId)
        setShowCancelModal(true)
    }

    const handleCancel = async () => {
        if (!bookingToCancel) return

        const ok = await cancelBooking(bookingToCancel)
        if (ok) {
            setShowCancelModal(false)
            setBookingToCancel(null)
            refetch()
            refetchUserBooking()
        }
    }

    const handleLogout = () => supabase.auth.signOut()

    return (
        <div className="min-h-screen bg-white">
            <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Dashboard</h1>
                            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Available Slots</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none mb-1">Role</p>
                            <p className="text-xs font-black text-slate-500 uppercase leading-none">{isAdmin ? 'Admin' : 'Participant'}</p>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={onViewAdmin}
                                className="text-[11px] sm:text-xs font-black text-white bg-slate-900 hover:bg-blue-600 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-lg shadow-slate-100 transition-all active:scale-95 uppercase tracking-widest"
                            >
                                Admin view
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="text-[11px] sm:text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
                {/* User Booking Status */}
                {!userBookingLoading && booking && (
                    <MyBookingCard
                        booking={booking}
                        onCancel={() => openCancelModal(booking.id)}
                        loading={actionLoading}
                    />
                )}

                {selectedSlotId ? (
                    <div className="max-w-md mx-auto bg-white/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Complete Booking</h2>
                        <BookingForm
                            onSubmit={handleBook}
                            onCancel={() => setSelectedSlotId(null)}
                            loading={actionLoading}
                        />
                        {bookingError && (
                            <p className="mt-4 text-sm font-bold text-red-600 text-center">{bookingError}</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
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
                                isAnySlotBooked={!!booking}
                            />
                        )}
                    </div>
                )}
            </main>

            <ConfirmationModal
                isOpen={showCancelModal}
                title="Cancel Booking?"
                message="Are you sure you want to cancel your booking? This spot will be freed up for others."
                onConfirm={handleCancel}
                onCancel={() => { setShowCancelModal(false); setBookingToCancel(null); }}
                loading={actionLoading}
            />
        </div>
    )
}
