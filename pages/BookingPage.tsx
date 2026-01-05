import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { Layout } from '../components/ui/Layout';
import { mockData } from '../services/mockApi';
import { Slot, Booking } from '../types';
import { SlotCard } from '../components/SlotCard';
import { BookingModal } from '../components/BookingModal';
import { useNavigate } from 'react-router-dom';
import { Loader2, CalendarCheck } from 'lucide-react';

export const BookingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [slots, setSlots] = useState<Slot[]>([]);
  const [userBooking, setUserBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [fetchedSlots, fetchedBooking] = await Promise.all([
        mockData.getSlots(),
        mockData.getUserBooking(user.id)
      ]);
      setSlots(fetchedSlots);
      setUserBooking(fetchedBooking);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSlotSelect = (slot: Slot) => {
    if (userBooking) {
      // If they already have a booking, clicking a slot should probably prompt to modify
      // For this page, we might just disable it or redirect to modify.
      // Instructions say "Modify Booking Page (/modify)" exists. 
      // Let's redirect them there if they click a slot while having a booking, or just show a message.
      // Better UX: Show a notification "You already have a booking" or redirect.
      navigate('/modify');
      return;
    }
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (phoneNumber: string) => {
    if (!selectedSlot || !user) return;
    await mockData.bookSlot(selectedSlot.id, user, phoneNumber);
    await fetchData(); // Refresh data
  };

  return (
    <Layout user={user} onLogout={logout}>
      
      {/* Header Area */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Available Slots</h1>
          <p className="text-slate-500">Select a time slot to reserve your resource.</p>
        </div>
        
        {userBooking && (
          <div 
            onClick={() => navigate('/modify')}
            className="bg-brand-50 border border-brand-100 p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-brand-100 transition-colors group"
          >
            <div className="bg-brand-200 p-2 rounded-full text-brand-700">
               <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-800 uppercase tracking-wide">Current Booking</p>
              <p className="text-sm text-brand-900 group-hover:underline">Click to manage</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map((slot) => {
            // Determine if this slot is the user's current booking
            const isCurrent = userBooking?.slotId === slot.id;
            return (
              <SlotCard 
                key={slot.id} 
                slot={slot} 
                isCurrentBooking={isCurrent}
                onSelect={handleSlotSelect}
                disabled={!!userBooking && !isCurrent} // Disable other slots if user has a booking
              />
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {user && (
        <BookingModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmBooking}
          slot={selectedSlot}
          user={user}
          mode="create"
        />
      )}
    </Layout>
  );
};