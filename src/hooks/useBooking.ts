import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper to sync slot stats manually
  const syncSlotStats = async (slotId: string) => {
    try {
      // 1. Get current booking count (the most reliable source)
      const { count, error: countError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('slot_id', slotId)

      if (countError) throw countError

      // 2. Get slot capacity
      const { data: slot, error: slotError } = await supabase
        .from('slots')
        .select('capacity')
        .eq('id', slotId)
        .single()

      if (slotError) throw slotError

      const newCount = count || 0
      const isFull = newCount >= (slot?.capacity || 1)

      // 3. Update the slot
      const { error: updateError } = await supabase
        .from('slots')
        .update({
          current_bookings: newCount,
          is_full: isFull
        })
        .eq('id', slotId)

      if (updateError) throw updateError

      console.log(`Sync complete for slot ${slotId}: ${newCount} bookings.`)

    } catch (err) {
      console.error('Error syncing slot stats:', err)
    }
  }

  const bookSlot = async (slotId: string, name: string, phone: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Pre-flight check: Does user already have a booking?
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('email', user.email)
        .maybeSingle()

      if (checkError) throw checkError
      if (existingBooking) {
        throw new Error('You already have an active booking. Please cancel it first if you wish to change slots.')
      }

      const { error: insertError } = await supabase.from('bookings').insert({
        slot_id: slotId,
        name,
        email: user.email,
        phone
      })

      if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          throw new Error('You already have an active booking.')
        }
        throw insertError
      }

      // Update slot stats immediately
      await syncSlotStats(slotId)

      setLoading(false)
      return true
    } catch (err: any) {
      console.error('Booking error:', err)
      setError(err.message)
      setLoading(false)
      return false
    }
  }

  const cancelBooking = async (bookingId: string) => {
    setLoading(true)
    setError(null)

    try {
      // 1. Get the slotId for the booking we are about to delete
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('slot_id')
        .eq('id', bookingId)
        .single()

      if (fetchError) throw fetchError
      if (!booking?.slot_id) throw new Error('Booking not found')

      const slotId = booking.slot_id

      // 2. Perform the deletion
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (deleteError) throw deleteError

      // 3. Explicitly update slot stats
      await syncSlotStats(slotId)

      setLoading(false)
      return true
    } catch (err: any) {
      console.error('Cancellation error:', err)
      setError(err.message)
      setLoading(false)
      return false
    }
  }

  return { bookSlot, cancelBooking, loading, error }
}
