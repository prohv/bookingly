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
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('slots')
      .select(`
        id,
        start_time,
        end_time,
        bookings ( id )
      `)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const availableSlots = data.filter(
      (slot) => slot.bookings.length === 0
    )

    setSlots(availableSlots)
    setLoading(false)
  }

  return { slots, loading, error, refetch: fetchSlots }
}