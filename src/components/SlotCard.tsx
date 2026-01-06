import { Slot } from "../types/slot";

type Props = {
  slot: Slot
  onBook: (slotId: string) => void
  disabled?: boolean
}

export function SlotCard({ slot, onBook, disabled }: Props) {
  const startTime = new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const endTime = new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const bookingsCount = slot.current_bookings || 0
  const capacity = slot.capacity || 1
  const spotsLeft = Math.max(0, capacity - bookingsCount)
  const isFull = slot.is_full || spotsLeft <= 0

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-4 sm:p-6 flex justify-between items-center border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase tracking-wider">Slot</p>
          <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full ${isFull ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
            {isFull ? 'FULL' : `${spotsLeft} LEFT`}
          </span>
        </div>
        <p className="text-lg sm:text-xl font-black text-slate-900">
          {startTime} – {endTime}
        </p>
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">
          {bookingsCount} / {capacity} SEATS
        </p>
      </div>

      <button
        onClick={() => onBook(slot.id)}
        disabled={disabled || isFull}
        className="glass-button bg-white text-slate-900 border-slate-100 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-300 disabled:opacity-50 disabled:group-hover:bg-white disabled:group-hover:text-slate-900 text-[11px] sm:text-xs py-2 px-4 sm:px-6 rounded-xl font-black uppercase tracking-widest"
      >
        {isFull ? 'Full' : disabled ? 'Reserved' : 'Book'}
      </button>
    </div>
  )
}