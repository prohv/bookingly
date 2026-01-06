import { Slot } from "../types/slot";

type Props = {
  slot: Slot
  onBook: (slotId: string) => void
  disabled?: boolean
}

export function SlotCard({ slot, onBook, disabled }: Props) {
  const startTime = new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const endTime = new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 flex justify-between items-center border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div>
        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Available Slot</p>
        <p className="text-xl font-extrabold text-slate-900">
          {startTime} – {endTime}
        </p>
      </div>

      <button
        onClick={() => onBook(slot.id)}
        disabled={disabled}
        className="glass-button bg-white text-slate-900 border-slate-100 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-300"
      >
        Book Now
      </button>
    </div>
  )
}