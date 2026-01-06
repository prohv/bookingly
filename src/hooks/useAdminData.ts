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
                .gte('end_time', new Date().toISOString())
                .order('start_time', { ascending: true })

            if (slotsError) throw slotsError
            setData((slots as any) as AdminSlot[])
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
