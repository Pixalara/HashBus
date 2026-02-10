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
    if (seat.status === 'booked' || seat.status === 'blocked') {
      return 'bg-slate-700 cursor-not-allowed border-slate-600 opacity-50';
    }
    if (isSeatSelected(seat)) {
      return 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400 shadow-lg shadow-amber-500/30 scale-105';
    }
    return 'bg-slate-800 hover:bg-slate-700 border-slate-600 hover:border-amber-500/50 hover:scale-105 cursor-pointer active:scale-95';
  };

  const maxRow = Math.max(...seats.map(s => s.row));
  const rows: (Seat | null)[][] = [];

  for (let r = 0; r <= maxRow; r++) {
    const rowSeats: (Seat | null)[] = [null, null, null, null, null];
    const seatsInRow = seats.filter(s => s.row === r);

    seatsInRow.forEach(seat => {
      if (seat.col >= 0 && seat.col < 5) {
        rowSeats[seat.col] = seat;
      }
    });

    rows.push(rowSeats);
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-5">Sleeper Coach Layout</h3>
        <div className="text-slate-400 text-sm mb-4">Select your preferred sleeper berths (Maximum 6 per booking)</div>
      </div>

      <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="text-center text-xs text-slate-500 font-medium">Left 1</div>
            <div className="text-center text-xs text-slate-500 font-medium">Left 2</div>
            <div className="text-center text-xs text-slate-500 font-medium">Aisle</div>
            <div className="text-center text-xs text-slate-500 font-medium">Right 1</div>
            <div className="text-center text-xs text-slate-500 font-medium">Right 2</div>
          </div>

          <div className="space-y-3">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-3">
                {row.map((seat, colIndex) => {
                  if (colIndex === 2) {
                    return (
                      <div key={`aisle-${rowIndex}`} className="flex items-center justify-center">
                        <div className="w-full h-16 border-l-2 border-r-2 border-dashed border-slate-700"></div>
                      </div>
                    );
                  }

                  if (!seat) {
                    return <div key={`empty-${rowIndex}-${colIndex}`} className="h-16"></div>;
                  }

                  return (
                    <button
                      key={seat.id}
                      onClick={() => (seat.status === 'available' || isSeatSelected(seat)) && onSeatSelect(seat)}
                      disabled={seat.status === 'booked' || seat.status === 'blocked'}
                      className={`relative h-16 w-full rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${getSeatStyle(
                        seat
                      )}`}
                    >
                      <span className="text-sm font-semibold text-white">{seat.number}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700 flex items-center gap-2 text-slate-400 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Driver Side</span>
          </div>
        </div>
      </div>
    </div>
  );
};
