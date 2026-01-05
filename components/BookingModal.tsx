import React, { useState } from 'react';
import { User, Slot } from '../types';
import { X, Calendar, User as UserIcon, Phone, Loader2, CheckCircle } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phoneNumber: string) => Promise<void>;
  slot: Slot | null;
  user: User;
  mode: 'create' | 'modify';
}

export const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  slot, 
  user,
  mode
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !slot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    try {
      await onConfirm(phoneNumber);
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setPhoneNumber('');
      }, 1500);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong.');
    }
  };

  const startTime = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = new Date(slot.startTime).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
        onClick={status !== 'loading' ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-lg">
            {mode === 'create' ? 'Confirm Booking' : 'Update Booking'}
          </h3>
          {status !== 'loading' && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Success State Overlay */}
        {status === 'success' ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-slate-800">Booking Confirmed!</h4>
            <p className="text-slate-500">You're all set for {date} at {startTime}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Slot Summary */}
            <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 flex items-start gap-3">
              <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-brand-900">{date}</p>
                <p className="text-sm text-brand-700">{startTime}</p>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm focus:outline-none cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400">Signed in via Google OAuth</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="tel" 
                    required
                    placeholder="(555) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {errorMessage}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition-all focus:ring-4 focus:ring-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                {status === 'loading' ? 'Processing...' : mode === 'create' ? 'Confirm Booking' : 'Update Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};