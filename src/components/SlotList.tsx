import { Slot } from '../types/slot'
import { SlotCard } from './SlotCard'

type Props = {
  slots: Slot[]
  onBook: (slotId: string) => void
  loading?: boolean
}

export function SlotList({ slots, onBook, loading }: Props) {
  if (loading) return <p>Loading slots...</p>

  if (slots.length === 0) {
    return <p>No available slots</p>
  }

  return (
    <div className="space-y-3">
      {slots.map((slot) => (
        <SlotCard
          key={slot.id}
          slot={slot}
          onBook={() => onBook(slot.id)}
        />
      ))}
    </div>
  )
}
