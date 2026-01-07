import { useState, useEffect } from 'react'
import { useSlots } from '../hooks/useSlots'
import { useBooking } from '../hooks/useBooking'
import { useUserBookings } from '../hooks/useUserBookings'
import { SlotList } from '../components/SlotList'
import Loader from '../components/Loader'
import { MyBookingCard } from '../components/MyBookingCard'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { OnboardingModal } from '../components/OnboardingModal'
import { supabase } from '../lib/supabase'

export default function Dashboard({ isAdmin, onViewAdmin }: { isAdmin?: boolean, onViewAdmin?: () => void }) {
    const { slots, loading: slotsLoading, error: slotsError, refetch } = useSlots()
    const { bookSlot, cancelBooking, loading: actionLoading, error: bookingError } = useBooking()
    const { booking, loading: userBookingLoading, refetch: refetchUserBooking } = useUserBookings()

    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [showBookingConfirmModal, setShowBookingConfirmModal] = useState(false)
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)

    // User Profile State
    const [userProfile, setUserProfile] = useState<{ name: string, phone: string, email: string } | null>(null)
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // Fetch user profile on mount
    useEffect(() => {
        const checkUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.email) return

            const { data } = await supabase
                .from('authorized_users')
                .select('name, phone, email')
                .eq('email', user.email)
                .single()

            if (data) {
                if (!data.name || !data.phone) {
                    setShowOnboarding(true)
                }
                setUserProfile(data as any)
            }
            setInitialLoading(false)
        }
        checkUserProfile()
    }, [])

    const handleOnboardingComplete = (name: string, phone: string) => {
        if (userProfile) {
            setUserProfile({ ...userProfile, name, phone })
        }
        setShowOnboarding(false)
    }

    const openBookingConfirm = (slotId: string) => {
        setSelectedSlotId(slotId)
        setShowBookingConfirmModal(true)
    }

    const handleBook = async () => {
        if (!selectedSlotId || !userProfile?.name || !userProfile?.phone) return

        const ok = await bookSlot(selectedSlotId, userProfile.name, userProfile.phone)
        if (ok) {
            setShowBookingConfirmModal(false)
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

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader />
            </div>
        )
    }

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
                            onBook={openBookingConfirm}
                            isAnySlotBooked={!!booking}
                        />
                    )}
                </div>
            </main>

            {/* Cancel Booking Modal */}
            <ConfirmationModal
                isOpen={showCancelModal}
                title="Cancel Booking?"
                message="Are you sure you want to cancel your booking? This spot will be freed up for others."
                onConfirm={handleCancel}
                onCancel={() => { setShowCancelModal(false); setBookingToCancel(null); }}
                loading={actionLoading}
            />

            {/* Confirm Booking Modal */}
            <ConfirmationModal
                isOpen={showBookingConfirmModal}
                title="Confirm Booking"
                message="Are you sure you want to book this slot?"
                onConfirm={handleBook}
                onCancel={() => { setShowBookingConfirmModal(false); setSelectedSlotId(null); }}
                loading={actionLoading}
                confirmText="Confirm Booking"
                cancelText="Cancel"
                variant="success"
            />

            {/* Show error if booking fails */}
            {bookingError && (
                <div className="fixed bottom-4 right-4 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 shadow-xl z-[100] animate-in slide-in-from-bottom-2">
                    <p className="font-bold text-sm">{bookingError}</p>
                    <button onClick={() => window.location.reload()} className="text-xs underline mt-1">Dismiss</button>
                </div>
            )}

            {/* Onboarding Modal - Force Open if needed */}
            <OnboardingModal
                isOpen={showOnboarding}
                email={userProfile?.email || ''}
                onComplete={handleOnboardingComplete}
            />
        </div>
    )
}
