import { UserBooking } from "../hooks/useUserBookings";

interface Props {
    booking: UserBooking;
    onCancel: (id: string) => void;
    loading?: boolean;
}

export function MyBookingCard({ booking, onCancel, loading }: Props) {
    const now = new Date();
    const startDate = new Date(booking.slot.start_time);
    const endDate = new Date(booking.slot.end_time);
    const isPast = now > endDate;

    const timeDisplay = startDate.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className={`border rounded-[2rem] p-4 sm:p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 transition-all animate-in fade-in slide-in-from-top-4 duration-500 ${isPast ? 'bg-slate-50/50 border-slate-100' : 'bg-green-50/50 border-green-100'}`}>
            <div className="flex items-start gap-3 sm:gap-4">
                <div className={`${isPast ? 'bg-slate-100 text-slate-400' : 'bg-green-100 text-green-600'} p-2.5 sm:p-3 rounded-2xl flex-shrink-0`}>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isPast ? "M5 13l4 4L19 7" : "M5 13l4 4L19 7"} />
                    </svg>
                </div>
                <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                        {isPast ? `Hope you enjoyed it, ${booking.name}!` : `You're all set, ${booking.name}!`}
                        <span className="ml-2 text-[10px] sm:text-xs font-bold text-slate-400 opacity-60 font-mono">
                            {booking.phone}
                        </span>
                    </h2>
                    <p className={`text-[13px] sm:text-sm font-bold mt-0.5 ${isPast ? 'text-slate-400' : 'text-green-700/70'}`}>
                        {isPast ? 'Attended on ' : 'Confirmed for '} {timeDisplay}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        {isPast ? (
                            <span className="text-[9px] sm:text-[10px] font-black bg-white px-2 py-0.5 rounded-full text-slate-400 border border-slate-100 uppercase tracking-widest">Completed</span>
                        ) : (
                            <span className="text-[9px] sm:text-[10px] font-black bg-white px-2 py-0.5 rounded-full text-green-600 border border-green-100 uppercase tracking-widest">Active</span>
                        )}
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-wider italic">Ref: {booking.id.slice(0, 8)}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onCancel(booking.id)}
                disabled={loading || isPast}
                className={`text-xs font-bold py-2 sm:px-4 rounded-xl transition-colors text-left sm:text-right ${isPast ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-red-500 disabled:opacity-50'}`}
            >
                {loading ? 'Processing...' : isPast ? 'Session Over' : 'Cancel Booking'}
            </button>
        </div>
    );
}
