import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface UserBooking {
    id: string;
    slot_id: string;
    name: string;
    email: string;
    phone: string;
    created_at: string;
    slot: {
        start_time: string;
        end_time: string;
    };
}

export function useUserBookings() {
    const [booking, setBooking] = useState<UserBooking | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUserBooking = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setBooking(null)
                return
            }

            const normalizedEmail = user.email!.toLowerCase()

            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id,
                    slot_id,
                    name,
                    email,
                    phone,
                    created_at,
                    slot:slots (
                        start_time,
                        end_time
                    )
                `)
                .eq('email', normalizedEmail)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    setBooking(null) // No booking found
                } else {
                    throw error
                }
            } else {
                setBooking(data as any)
            }
        } catch (err: any) {
            console.error('Fetch user booking error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserBooking()

        // Listen for changes to bookings table
        const channel = supabase
            .channel('user-booking-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                () => fetchUserBooking()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return { booking, loading, error, refetch: fetchUserBooking }
}
