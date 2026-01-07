import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Slot } from "../types/slot";

export interface AdminSlot extends Slot {
    bookings: Array<{
        id: string;
        name: string;
        email: string;
        phone: string;
        created_at: string;
    }>;
    slot_admins: Array<{
        id: string;
        admin_id: string;
        authorized_users: {
            name: string;
            email: string;
        }
    }>;
}

export function useAdminData() {
    const [data, setData] = useState<AdminSlot[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            const { data: slots, error: slotsError } = await supabase
                .from('slots')
                .select(`
                    id,
                    start_time,
                    end_time,
                    capacity,
                    current_bookings,
                    is_full,
                    bookings (
                        id,
                        name,
                        email,
                        phone,
                        created_at
                    ),
                    slot_admins (
                        id,
                        admin_id,
                        authorized_users (
                            name,
                            email
                        )
                    )
                `)
                .order('start_time', { ascending: true })

            if (slotsError) throw slotsError

            const now = new Date()
            const allSlots = (slots as any) as AdminSlot[]

            // Split into active and past
            const activeSlots = allSlots.filter(s => new Date(s.end_time) >= now)
            const pastSlots = allSlots.filter(s => new Date(s.end_time) < now)

            // activeSlots are already sorted ASC by DB
            // pastSlots are sorted ASC by DB, so reverse them to get DESC (most recent past first)

            setData([...activeSlots, ...pastSlots.reverse()])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()

        const channel = supabase
            .channel('admin-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'slots' },
                () => fetchData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                () => fetchData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'slot_admins' },
                () => fetchData()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return { data, loading, error, refetch: fetchData }
}
