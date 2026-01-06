import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bookSlot = async (slotId: string, name: string) => {
    setLoading(true)
    setError(null)

    const user = (await supabase.auth.getUser()).data.user
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return false
    }

    const { error } = await supabase.from('bookings').insert({
      slot_id: slotId,
      name,
      email: user.email
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    setLoading(false)
    return true
  }

  const cancelBooking = async (bookingId: string) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    setLoading(false)
    return true
  }

  return { bookSlot, cancelBooking, loading, error }
}
