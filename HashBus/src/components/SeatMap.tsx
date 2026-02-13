import React from 'react';
import { Seat } from '../types';

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  userGender?: 'Male' | 'Female' | 'Other';
}

export const SeatMap: React.FC<SeatMapProps> = ({ 
  seats, 
  selectedSeats, 
  onSeatSelect,
  userGender = 'Other'
}) => {
  const isSeatSelected = (seat: Seat) => {
    return selectedSeats.some((s) => s.id === seat.id);
  };

  const canSelectSeat = (seat: Seat): boolean => {
    if (seat.status === 'booked' || seat.status === 'blocked' || 
        seat.status === 'booked_male' || seat.status === 'booked_female') {
      return false;
    }
    return true;
  };

  const getSeatStyle = (seat: Seat) => {
    if (seat.status === 'booked' || seat.status === 'blocked') {
      return 'bg-slate-300 cursor-not-allowed opacity-40 border-slate-300';
    }

    if (seat.status === 'booked_male') {
      return 'bg-blue-300 cursor-not-allowed opacity-50 border-blue-300';
    }

    if (seat.status === 'booked_female') {
      return 'bg-pink-300 cursor-not-allowed opacity-50 border-pink-300';
    }

    if (isSeatSelected(seat)) {
      return 'bg-green-500 border-green-600 shadow-lg shadow-green-500/40 text-white font-semibold';
    }

    return 'bg-white border-green-500 hover:bg-green-50 border-2 cursor-pointer hover:shadow-md transition-all';
  };

  const lowerDeckSeats = seats.filter(s => s.deck === 'lower').sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });
  
  const upperDeckSeats = seats.filter(s => s.deck === 'upper').sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  const buildDeckLayout = (deckSeats: Seat[]) => {
    const rows: Seat[][] = [];

    for (let r = 0; r < 8; r++) {
      const seatsInRow = deckSeats.filter(s => s.row === r).sort((a, b) => a.col - b.col);
      if (seatsInRow.length > 0) {
        rows.push(seatsInRow);
      }
    }

    return rows;
  };

  const lowerRows = buildDeckLayout(lowerDeckSeats);
  const upperRows = buildDeckLayout(upperDeckSeats);

  const renderSeatButton = (seat: Seat) => {
    const isDisabled = !canSelectSeat(seat);
    const isSelected = isSeatSelected(seat);

    return (
      <button
        key={seat.id}
        onClick={() => !isDisabled && onSeatSelect(seat)}
        disabled={isDisabled}
        title={`Seat ${seat.number} - ₹${seat.price}`}
        className={`h-14 w-14 sm:h-20 sm:w-20 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-0.5 font-bold text-xs sm:text-sm ${getSeatStyle(
          seat
        )} ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`leading-none ${isSelected ? 'text-white' : 'text-slate-700'}`}>
          {seat.number}
        </span>
        <span className={`text-xs leading-none font-semibold ${isSelected ? 'text-white' : 'text-green-600'}`}>
          ₹{Math.floor(seat.price)}
        </span>
      </button>
    );
  };

  const renderDeck = (rows: Seat[][], deckName: string) => (
    <div className="flex-1 min-w-0">
      <div className="text-center mb-3 sm:mb-6">
        <div className="flex items-center gap-2 justify-center">
          <h3 className="text-slate-700 font-bold text-sm sm:text-base">{deckName}</h3>
          {deckName === 'Lower deck' && (
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" strokeWidth="2" />
              <circle cx="12" cy="12" r="2" strokeWidth="2" />
            </svg>
          )}
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {rows.map((row, rowIndex) => {
          // Separate single seats (col 0) from double seats (col 1, 2)
          const singleSeats = row.filter(s => s.col === 0);
          const doubleSeats = row.filter(s => s.col > 0);
          
          return (
            <div 
              key={`${deckName}-row-${rowIndex}`} 
              className="flex gap-2 sm:gap-6 justify-center items-center px-2 sm:px-0"
            >
              {/* Single seats on LEFT */}
              <div className="flex gap-1 sm:gap-2">
                {singleSeats.map(seat => (
                  <div key={seat.id}>
                    {renderSeatButton(seat)}
                  </div>
                ))}
              </div>

              {/* Gap between single and double */}
              {doubleSeats.length > 0 && singleSeats.length > 0 && (
                <div className="w-2 sm:w-4"></div>
              )}

              {/* Double seats on RIGHT */}
              <div className="flex gap-1 sm:gap-2">
                {doubleSeats.map(seat => (
                  <div key={seat.id}>
                    {renderSeatButton(seat)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-8 px-3 sm:px-0">
      {/* Header */}
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Select Your Sleeper Seats</h3>
        <p className="text-slate-400 text-xs sm:text-sm">Choose your preferred sleeper berths (Maximum 6 per booking)</p>
      </div>

      {/* Both Decks Side by Side - Mobile Responsive */}
      <div className="bg-white rounded-2xl p-3 sm:p-8 shadow-lg overflow-x-auto">
        <div className="flex gap-3 sm:gap-12 justify-center min-w-max sm:min-w-0">
          {/* Lower Deck */}
          {lowerRows.length > 0 && renderDeck(lowerRows, 'Lower deck')}

          {/* Divider */}
          <div className="w-px bg-gray-300 hidden sm:block"></div>

          {/* Upper Deck */}
          {upperRows.length > 0 && renderDeck(upperRows, 'Upper deck')}
        </div>
      </div>

      {/* Legends & Summary */}
      <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-700">
        <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-5">Seat Information</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6">
          {/* Available */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border-2 border-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-slate-700">1</span>
            </div>
            <div>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">Available</p>
              <p className="text-slate-500 text-xs">Ready to book</p>
            </div>
          </div>

          {/* Selected */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 border-2 border-green-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/40">
              <span className="text-xs sm:text-sm font-semibold text-white">1</span>
            </div>
            <div>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">Selected</p>
              <p className="text-slate-500 text-xs">Your choice</p>
            </div>
          </div>

          {/* Booked */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-300 border-2 border-slate-300 rounded-lg flex items-center justify-center flex-shrink-0 opacity-40">
              <span className="text-xs sm:text-sm font-semibold text-slate-600">X</span>
            </div>
            <div>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">Booked</p>
              <p className="text-slate-500 text-xs">Not available</p>
            </div>
          </div>

          {/* Booked Male */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-300 border-2 border-blue-400 rounded-lg flex items-center justify-center flex-shrink-0 opacity-50">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">Booked by Male</p>
              <p className="text-slate-500 text-xs">Male passenger</p>
            </div>
          </div>

          {/* Booked Female */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-300 border-2 border-pink-400 rounded-lg flex items-center justify-center flex-shrink-0 opacity-50">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-pink-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">Booked by Female</p>
              <p className="text-slate-500 text-xs">Female passenger</p>
            </div>
          </div>

          {/* Blocked */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-500 border-2 border-slate-600 rounded-lg flex items-center justify-center flex-shrink-0 opacity-50">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">Blocked</p>
              <p className="text-slate-500 text-xs">Unavailable</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="pt-4 sm:pt-6 border-t border-slate-700">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <p className="text-slate-400 text-xs">Total</p>
              <p className="text-white font-semibold text-base sm:text-lg">{seats.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Available</p>
              <p className="text-green-400 font-semibold text-base sm:text-lg">
                {seats.filter(s => s.status === 'available').length}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Selected</p>
              <p className="text-amber-400 font-semibold text-base sm:text-lg">{selectedSeats.length} / 6</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 sm:p-4">
        <p className="text-blue-300 text-xs sm:text-sm">
          <strong>💡 Layout:</strong> Lower deck: Single seat (left) with gap + 2 double seats (right). 
          Upper deck: 3 double seats. Total 40 seats (20 per deck).
        </p>
      </div>
    </div>
  );
};