import { User, Slot, Booking } from '../types';

// Initial Mock Data
const MOCK_SLOTS: Slot[] = [
  { id: '1', startTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), capacity: 5, bookedCount: 2 },
  { id: '2', startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), capacity: 5, bookedCount: 5 }, // Full
  { id: '3', startTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(), capacity: 5, bookedCount: 0 },
  { id: '4', startTime: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(), capacity: 3, bookedCount: 1 },
  { id: '5', startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(), capacity: 3, bookedCount: 3 }, // Full
  { id: '6', startTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(), capacity: 5, bookedCount: 1 },
];

let bookingsStore: Booking[] = [];
let slotsStore: Slot[] = [...MOCK_SLOTS];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuth = {
  login: async (email: string): Promise<User> => {
    await delay(800);
    // Domain Restriction Check
    if (!email.endsWith('@college.edu')) {
      throw new Error('Access restricted to @college.edu emails only.');
    }
    return {
      id: 'user_123',
      email,
      name: email.split('@')[0],
      avatarUrl: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=0ea5e9&color=fff`
    };
  },
  logout: async () => {
    await delay(300);
  }
};

export const mockData = {
  getSlots: async (): Promise<Slot[]> => {
    await delay(600);
    return [...slotsStore];
  },

  getUserBooking: async (userId: string): Promise<Booking | null> => {
    await delay(400);
    return bookingsStore.find(b => b.userId === userId) || null;
  },

  bookSlot: async (slotId: string, user: User, phoneNumber: string): Promise<Booking> => {
    await delay(1000);
    
    // Validate
    const slotIndex = slotsStore.findIndex(s => s.id === slotId);
    if (slotIndex === -1) throw new Error('Slot not found');
    
    const slot = slotsStore[slotIndex];
    if (slot.bookedCount >= slot.capacity) throw new Error('Slot is full');

    const existingBooking = bookingsStore.find(b => b.userId === user.id);
    if (existingBooking) throw new Error('You already have an active booking.');

    // Update state
    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      slotId,
      userId: user.id,
      userEmail: user.email,
      phoneNumber,
      createdAt: new Date().toISOString()
    };

    bookingsStore.push(newBooking);
    slotsStore[slotIndex] = { ...slot, bookedCount: slot.bookedCount + 1 };
    
    return newBooking;
  },

  cancelBooking: async (bookingId: string): Promise<void> => {
    await delay(800);
    const bookingIndex = bookingsStore.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) throw new Error('Booking not found');
    
    const booking = bookingsStore[bookingIndex];
    const slotIndex = slotsStore.findIndex(s => s.id === booking.slotId);
    
    if (slotIndex !== -1) {
       slotsStore[slotIndex] = { 
         ...slotsStore[slotIndex], 
         bookedCount: Math.max(0, slotsStore[slotIndex].bookedCount - 1) 
       };
    }
    
    bookingsStore.splice(bookingIndex, 1);
  },

  updateBooking: async (currentBookingId: string, newSlotId: string, user: User, phoneNumber: string): Promise<Booking> => {
    // Transactional simulation
    await mockData.cancelBooking(currentBookingId);
    return await mockData.bookSlot(newSlotId, user, phoneNumber);
  }
};