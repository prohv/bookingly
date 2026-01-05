import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { Layout } from '../components/ui/Layout';
import { mockData } from '../services/mockApi';
import { Slot, Booking } from '../types';
import { SlotCard } from '../components/SlotCard';
import { BookingModal } from '../components/BookingModal';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Trash2 } from 'lucide-react';

export const ModifyBookingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [slots, setSlots] = useState<Slot[]>([]);
  const [userBooking, setUserBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [newSlot, setNewSlot] = useState<Slot | null>(null);
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
      
      // If no booking exists, redirect back to home
      if (!fetchedBooking) {
        navigate('/');
      }
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
    if (userBooking?.slotId === slot.id) return; // Can't switch to same slot
    setNewSlot(slot);
    setIsModalOpen(true);
  };

  const handleConfirmUpdate = async (phoneNumber: string) => {
    if (!newSlot || !user || !userBooking) return;
    await mockData.updateBooking(userBooking.id, newSlot.id, user, phoneNumber);
    navigate('/');
  };

  const handleCancelBooking = async () => {
    if (window.confirm('Are you sure you want to cancel your booking?')) {
      if (!userBooking) return;
      await mockData.cancelBooking(userBooking.id);
      navigate('/');
    }
  };

  return (
    <Layout user={user} onLogout={logout}>
      
      <div className="mb-6">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
        
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Change Your Time</h1>
                <p className="text-slate-500">Select a new slot to move your booking.</p>
            </div>
            {userBooking && (
                <button 
                    onClick={handleCancelBooking}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Cancel Booking
                </button>
            )}
        </div>
      </div>

      {loading ? (
         <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map((slot) => {
            const isCurrent = userBooking?.slotId === slot.id;
            return (
              <SlotCard 
                key={slot.id} 
                slot={slot} 
                isCurrentBooking={isCurrent}
                isSelected={newSlot?.id === slot.id}
                onSelect={handleSlotSelect}
                // Don't disable anything here unless it's full (handled by card), 
                // because we want them to be able to pick a new one.
              />
            );
          })}
        </div>
      )}

      {user && (
        <BookingModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmUpdate}
          slot={newSlot}
          user={user}
          mode="modify"
        />
      )}
    </Layout>
  );
};