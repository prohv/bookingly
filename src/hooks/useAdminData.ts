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
                    )
                `)
                .gte('end_time', new Date().toISOString())
                .order('start_time', { ascending: true })

            if (slotsError) throw slotsError
            setData(Array.isArray(slots) ? slots : [])
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
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return { data, loading, error, refetch: fetchData }
}
