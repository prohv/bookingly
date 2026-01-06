export type Slot = {
    id: string,
    start_time: string,
    end_time: string,
    capacity: number,
    current_bookings: number,
    is_full: boolean,
    bookings?: Array<{ id: string }>
}