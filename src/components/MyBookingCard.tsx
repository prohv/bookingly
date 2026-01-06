import { UserBooking } from "../hooks/useUserBookings";

interface Props {
    booking: UserBooking;
    onCancel: (id: string) => void;
    loading?: boolean;
}

export function MyBookingCard({ booking, onCancel, loading }: Props) {
    const startDate = new Date(booking.slot.start_time);
    const timeDisplay = startDate.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="bg-green-50/50 border border-green-100 rounded-3xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-2xl text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-900 leading-tight">You're all set, {booking.name}!</h2>
                    <p className="text-sm font-bold text-green-700/70 mt-0.5">Your booking is confirmed for {timeDisplay}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-full text-green-600 border border-green-100 uppercase tracking-widest">Confirmed</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider italic">Ref: {booking.id.slice(0, 8)}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onCancel(booking.id)}
                disabled={loading}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 py-2 px-4 rounded-xl transition-colors disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Cancel Booking'}
            </button>
        </div>
    );
}
