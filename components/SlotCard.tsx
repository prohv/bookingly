import React from 'react';
import { Slot } from '../types';
import { Clock, Users } from 'lucide-react';

interface SlotCardProps {
  slot: Slot;
  isSelected?: boolean;
  isCurrentBooking?: boolean;
  onSelect: (slot: Slot) => void;
  disabled?: boolean;
}

export const SlotCard: React.FC<SlotCardProps> = ({ 
  slot, 
  isSelected, 
  isCurrentBooking, 
  onSelect, 
  disabled 
}) => {
  const startTime = new Date(slot.startTime);
  const endTime = new Date(slot.endTime);
  
  const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' });
  const isFull = slot.bookedCount >= slot.capacity;
  const spotsLeft = slot.capacity - slot.bookedCount;

  // Visual State Calculation
  let containerClasses = "relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 group";
  let buttonClasses = "mt-4 w-full py-2 px-4 rounded-lg font-medium text-sm transition-all";
  
  if (isCurrentBooking) {
    containerClasses += " bg-brand-50 border-brand-200 ring-2 ring-brand-500 ring-offset-2";
    buttonClasses += " bg-brand-600 text-white shadow-md hover:bg-brand-700";
  } else if (isSelected) {
    containerClasses += " bg-slate-800 border-slate-800 text-white shadow-lg transform scale-[1.02]";
    buttonClasses += " bg-white text-slate-900 hover:bg-slate-100";
  } else if (isFull) {
    containerClasses += " bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed";
    buttonClasses += " bg-slate-200 text-slate-400 cursor-not-allowed";
  } else {
    containerClasses += " bg-white border-slate-200 hover:border-slate-300 hover:shadow-md cursor-pointer";
    buttonClasses += " bg-slate-900 text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300";
  }

  // Mobile optimization: always show button on mobile, handle hover only on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  if (isMobile && !isFull && !isSelected && !isCurrentBooking) {
     buttonClasses = buttonClasses.replace("opacity-0", "opacity-100").replace("translate-y-2", "translate-y-0");
  }

  return (
    <div 
      className={containerClasses}
      onClick={() => !isFull && !disabled && onSelect(slot)}
      role="button"
      aria-disabled={isFull || disabled}
      tabIndex={isFull || disabled ? -1 : 0}
    >
      {isCurrentBooking && (
        <span className="absolute -top-3 left-4 bg-brand-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">
          Current
        </span>
      )}

      <div>
        <div className="flex items-center gap-2 mb-1">
          <Clock className={`w-4 h-4 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`} />
          <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
            {timeFormatter.format(startTime)} - {timeFormatter.format(endTime)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Users className={`w-4 h-4 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`} />
          <span className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
            {isFull ? 'Full capacity' : `${spotsLeft} spots left`}
          </span>
        </div>
      </div>

      <button className={buttonClasses} disabled={isFull || disabled}>
        {isCurrentBooking ? 'Your Booking' : isFull ? 'Fully Booked' : isSelected ? 'Selected' : 'Book Now'}
      </button>
    </div>
  );
};