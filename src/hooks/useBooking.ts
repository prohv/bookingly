import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper to sync slot stats manually via secure RPC
  const syncSlotStats = async (slotId: string) => {
    try {
      // Call the secure database function to recount and update
      const { error: rpcError } = await supabase.rpc('sync_slot_stats', {
        p_slot_id: slotId
      })

      if (rpcError) throw rpcError
      console.log(`Sync complete for slot ${slotId} via RPC.`)
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

      const normalizedEmail = user.email!.toLowerCase()

      // Pre-flight check: Does user already have a booking?
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle()

      if (checkError) throw checkError
      if (existingBooking) {
        throw new Error('You already have an active booking. Please cancel it first if you wish to change slots.')
      }

      const { error: insertError } = await supabase.from('bookings').insert({
        slot_id: slotId,
        name,
        email: normalizedEmail,
        phone
      })

      if (insertError) {
        console.error('Insert error details:', {
          code: insertError.code,
          message: insertError.message,
          details: (insertError as any).details,
          hint: (insertError as any).hint
        })
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
