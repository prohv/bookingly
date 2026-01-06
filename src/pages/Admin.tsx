import { useState } from "react"
import { useAdminData } from "../hooks/useAdminData"
import { useBooking } from "../hooks/useBooking"
import Loader from "../components/Loader"
import { ConfirmationModal } from "../components/ConfirmationModal"
import { supabase } from "../lib/supabase"

export default function Admin({ onBack }: { onBack: () => void }) {
    const { data: slots = [], loading, error, refetch } = useAdminData()
    const { cancelBooking, loading: actionLoading } = useBooking()

    const [showCancelModal, setShowCancelModal] = useState(false)
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)

    const handleLogout = () => supabase.auth.signOut()

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
        }
    }

    // Calculate Stats with defensive checks
    const totalSlots = slots?.length || 0
    const totalBookings = slots?.reduce((acc, s) => acc + (s.current_bookings || 0), 0) || 0
    const fullSlots = slots?.filter(s => s.is_full || (s.current_bookings || 0) >= (s.capacity || 1)).length || 0
    const totalCapacity = slots?.reduce((acc, s) => acc + (s.capacity || 0), 0) || 0

    const efficiency = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0

    return (
        <div className="min-h-screen bg-slate-50/50">
            <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
                            title="Back to Dashboard"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                Admin Control Panel
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            </h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time Overview</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Total Bookings</p>
                        <p className="text-3xl font-black text-slate-900 text-center">{totalBookings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Slots</p>
                        <p className="text-3xl font-black text-blue-600">{fullSlots} / {totalSlots}</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Capacity</p>
                        <p className="text-3xl font-black text-slate-900">{totalBookings} / {totalCapacity}</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                        <p className="text-3xl font-black text-slate-900">{efficiency}%</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 font-bold p-4 rounded-2xl mb-8 border border-red-100 flex items-center gap-3">
                        <span className="text-xl">⚠️</span> {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {slots?.map((slot) => {
                            if (!slot) return null;

                            const dateObj = slot.start_time ? new Date(slot.start_time) : null;
                            const startTime = dateObj && !isNaN(dateObj.getTime())
                                ? dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Unknown'

                            const bookings = slot.bookings || []
                            const count = slot.current_bookings || 0
                            const capacity = slot.capacity || 1
                            const percent = Math.min(100, (count / capacity) * 100)
                            const isFull = slot.is_full || count >= capacity

                            return (
                                <div key={slot.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-2xl font-black text-slate-900">{startTime}</h3>
                                                {isFull ? (
                                                    <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Full</span>
                                                ) : (
                                                    <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Open</span>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slot ID: {slot.id}</p>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Registrations</p>
                                                <p className="text-3xl font-black text-slate-900">{count} <span className="text-slate-200 text-lg">/ {capacity}</span></p>
                                            </div>
                                            <div className="w-32 h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${percent >= 100 ? 'bg-red-500' :
                                                            percent >= 70 ? 'bg-orange-400' : 'bg-blue-500'
                                                        }`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        {count > 0 ? (
                                            <div className="overflow-hidden rounded-2xl border border-slate-50">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            <th className="px-6 py-4">Participant Name</th>
                                                            <th className="px-6 py-4">Contact Info (Email / Phone)</th>
                                                            <th className="px-6 py-4">Booked At</th>
                                                            <th className="px-6 py-4 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {bookings.map((booking: any) => (
                                                            <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                                                <td className="px-6 py-4">
                                                                    <p className="text-sm font-black text-slate-900">{booking.name || 'Anonymous'}</p>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-slate-600">{booking.email}</span>
                                                                        <span className="text-xs font-bold text-blue-500">{booking.phone || 'No phone'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <p className="text-xs font-bold text-slate-400">
                                                                        {booking.created_at ? new Date(booking.created_at).toLocaleTimeString() : 'Unknown'}
                                                                    </p>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <button
                                                                        disabled={actionLoading}
                                                                        onClick={() => openCancelModal(booking.id)}
                                                                        className="opacity-0 group-hover:opacity-100 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-xl transition-all active:scale-95"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-slate-50/30 rounded-[2rem] border-2 border-dashed border-slate-100">
                                                <span className="text-3xl mb-3 block">⏳</span>
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Awaiting registrations</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            <ConfirmationModal
                isOpen={showCancelModal}
                title="Remove Booking?"
                message="Are you sure you want to remove this participant's booking? This action cannot be undone."
                onConfirm={handleCancel}
                onCancel={() => { setShowCancelModal(false); setBookingToCancel(null); }}
                loading={actionLoading}
            />
        </div>
    )
}
