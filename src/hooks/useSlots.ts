import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Slot } from "../types/slot";

export function useSlots() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('slots')
        .select(`
          id,
          start_time,
          end_time,
          capacity,
          bookings ( id )
        `)

      if (error) throw error

      if (!data) {
        setSlots([])
        return
      }

      const availableSlots = data.filter(
        (slot: any) => (slot.bookings?.length || 0) < (slot.capacity || 1)
      )

      setSlots(availableSlots)
    } catch (err: any) {
      console.error('Error fetching slots:', err)
      setError(err.message || 'Failed to load slots')
    } finally {
      setLoading(false)
    }
  }

  return { slots, loading, error, refetch: fetchSlots }
}