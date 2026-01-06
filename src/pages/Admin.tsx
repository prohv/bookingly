import { useState } from "react"
import { useAdminData, AdminSlot } from "../hooks/useAdminData"
import { useBooking } from "../hooks/useBooking"
import Loader from "../components/Loader"
import { ConfirmationModal } from "../components/ConfirmationModal"

export default function Admin({ onBack }: { onBack: () => void }) {
    const { data: slots = [], loading, error, refetch } = useAdminData()
    const { cancelBooking, loading: actionLoading } = useBooking()

    const [showCancelModal, setShowCancelModal] = useState(false)
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)

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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center">
                <Loader />
            </div>
        )
    }

    const totalSlots = Array.isArray(slots) ? slots.length : 0
    const totalBookings = Array.isArray(slots)
        ? slots.reduce((acc, s) => acc + (s?.current_bookings || 0), 0)
        : 0
    const fullSlots = Array.isArray(slots)
        ? slots.filter(s => s?.is_full || (s?.current_bookings || 0) >= (s?.capacity || 1)).length
        : 0

    return (
        <div className="min-h-screen bg-slate-50/50">
            <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-6">
                        <button
                            onClick={onBack}
                            className="p-1 sm:p-2 hover:bg-slate-50 rounded-lg sm:rounded-xl transition-colors text-slate-400 hover:text-slate-900"
                            title="Back to Dashboard"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="h-6 sm:h-8 w-px bg-slate-100" />
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div>
                                <h1 className="text-sm sm:text-xl font-black text-slate-900 whitespace-nowrap flex items-center">
                                    Admin Panel
                                    <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 ml-1.5 sm:ml-2 animate-pulse" />
                                </h1>
                                <p className="text-[9px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-widest leading-none mt-0.5">Live View</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-4">
                        <div className="px-2 py-0.5 sm:px-4 sm:py-1.5 bg-blue-50/50 rounded-lg sm:rounded-2xl border border-blue-100 flex items-center gap-1.5 sm:block transition-all hover:bg-blue-50">
                            <p className="text-[8px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Bookings</p>
                            <p className="text-xs sm:text-base font-black text-blue-700 leading-none">{totalBookings}</p>
                        </div>
                        <div className="px-2 py-0.5 sm:px-4 sm:py-1.5 bg-slate-50 rounded-lg sm:rounded-2xl border border-slate-100 flex items-center gap-1.5 sm:block transition-all hover:bg-slate-100">
                            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Full Slots</p>
                            <p className="text-xs sm:text-base font-black text-slate-600 leading-none">{fullSlots}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {error && (
                    <div className="bg-red-50 text-red-600 font-bold p-4 rounded-2xl mb-8 border border-red-100 flex items-center gap-3 text-sm">
                        <span className="text-xl">⚠️</span> {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {Array.isArray(slots) && slots.map((slot: AdminSlot) => {
                        if (!slot) return null;

                        const dateObj = slot.start_time ? new Date(slot.start_time) : null;
                        const startTime = (dateObj && !isNaN(dateObj.getTime()))
                            ? dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'Unknown'

                        const rawBookings = (slot as any).bookings;
                        const bookings = Array.isArray(rawBookings)
                            ? rawBookings
                            : (rawBookings ? [rawBookings] : []);

                        const count = slot.current_bookings || 0
                        const capacity = slot.capacity || 1
                        const isFull = slot.is_full || count >= capacity

                        return (
                            <div key={slot.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm transition-all duration-300">
                                <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6">
                                    <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                                        <div className="flex items-center justify-between sm:justify-start gap-4">
                                            <h3 className="text-base sm:text-2xl font-black text-slate-900 leading-tight">{startTime}</h3>

                                            {/* Desktop Tags (Back on the left) */}
                                            <div className="hidden sm:flex items-center gap-3">
                                                {isFull ? (
                                                    <span className="bg-red-50 text-red-600 text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Full</span>
                                                ) : (
                                                    <span className="bg-green-50 text-green-600 text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Open</span>
                                                )}
                                                <p className="text-[11px] font-bold text-slate-200 uppercase tracking-widest whitespace-nowrap">ID: {slot.id.slice(0, 8)}</p>
                                            </div>

                                            {/* Mobile Reg Status */}
                                            <div className="sm:hidden text-right">
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Reg Status: <span className="text-slate-900 font-black">{count} / {capacity}</span></p>
                                            </div>
                                        </div>

                                        {/* Mobile Tags (Line 2) */}
                                        <div className="flex sm:hidden items-center gap-2">
                                            {isFull ? (
                                                <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Full</span>
                                            ) : (
                                                <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Open</span>
                                            )}
                                            <p className="text-[9px] font-bold text-slate-200 uppercase tracking-widest">ID: {slot.id.slice(0, 8)}</p>
                                        </div>
                                    </div>

                                    <div className="hidden sm:block text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Registration Status</p>
                                        <p className="text-2xl font-black text-slate-900 leading-none">{count} <span className="text-slate-200 text-sm">/ {capacity}</span></p>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6 bg-slate-50/5">
                                    {bookings.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                            {bookings.map((booking: any) => (
                                                <div key={booking?.id} className="bg-white p-3 rounded-xl border border-slate-50 shadow-sm group relative overflow-hidden transition-all hover:border-blue-100 hover:shadow-md">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <div className="overflow-hidden">
                                                            <p className="text-[13px] sm:text-[14px] font-black text-slate-800 leading-tight truncate" title={booking?.name}>
                                                                {booking?.name || 'Anonymous'}
                                                            </p>
                                                            <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider leading-tight">
                                                                {booking?.phone || 'No phone'}
                                                            </p>
                                                        </div>
                                                        <button
                                                            disabled={actionLoading}
                                                            onClick={() => openCancelModal(booking?.id)}
                                                            className="text-slate-200 hover:text-red-500 transition-colors p-1 sm:p-1.5 flex-shrink-0"
                                                            title="Remove participant"
                                                        >
                                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-[10px] font-medium text-slate-400 truncate hidden md:block" title={booking?.email}>
                                                            {booking?.email}
                                                        </p>
                                                        <p className="text-[8px] font-bold text-slate-200 uppercase hidden md:block">
                                                            {booking?.created_at ? new Date(booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                                            {count > 0 ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader />
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                                                        Loading participant details (Count: {count})
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="text-xl">⏳</span>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Awaiting registrations
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>

            <ConfirmationModal
                isOpen={showCancelModal}
                title="Remove Registration?"
                message="Are you sure you want to remove this participant?"
                onConfirm={handleCancel}
                onCancel={() => { setShowCancelModal(false); setBookingToCancel(null); }}
                loading={actionLoading}
                confirmText="Yes, remove"
                cancelText="Keep it"
            />
        </div>
    )
}
