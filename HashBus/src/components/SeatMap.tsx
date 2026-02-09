import React from 'react';
import { Seat } from '../types';

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({ seats, selectedSeats, onSeatSelect }) => {
  const isSeatSelected = (seat: Seat) => {
    return selectedSeats.some((s) => s.id === seat.id);
  };

  const getSeatStyle = (seat: Seat) => {
    if (seat.status === 'booked') {
      return 'bg-slate-700 cursor-not-allowed border-slate-600 opacity-50';
    }
    if (isSeatSelected(seat)) {
      return 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400 shadow-lg shadow-amber-500/30 scale-105';
    }
    return 'bg-slate-800 hover:bg-slate-700 border-slate-600 hover:border-amber-500/50 hover:scale-105 cursor-pointer active:scale-95';
  };

  const lowerSeats = seats.filter((s) => s.position === 'lower');
  const upperSeats = seats.filter((s) => s.position === 'upper');

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-semibold text-white mb-5">Lower Berth</h3>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3 sm:gap-4">
          {lowerSeats.map((seat) => (
            <button
              key={seat.id}
              onClick={() => seat.status === 'available' && onSeatSelect(seat)}
              disabled={seat.status === 'booked'}
              className={`relative min-h-[72px] sm:min-h-[80px] rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${getSeatStyle(
                seat
              )}`}
            >
              <span className="text-sm sm:text-base font-semibold text-white">{seat.number}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-5">Upper Berth</h3>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3 sm:gap-4">
          {upperSeats.map((seat) => (
            <button
              key={seat.id}
              onClick={() => seat.status === 'available' && onSeatSelect(seat)}
              disabled={seat.status === 'booked'}
              className={`relative min-h-[72px] sm:min-h-[80px] rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${getSeatStyle(
                seat
              )}`}
            >
              <span className="text-sm sm:text-base font-semibold text-white">{seat.number}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
