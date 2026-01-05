export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Slot {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  capacity: number;
  bookedCount: number;
  isBookedByUser?: boolean; // Helper for frontend state
}

export interface Booking {
  id: string;
  slotId: string;
  userId: string;
  userEmail: string;
  phoneNumber: string;
  createdAt: string;
}

// Mock Database Schema
export interface DbState {
  users: User[];
  slots: Slot[];
  bookings: Booking[];
}
