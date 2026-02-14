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
  // ✅ Debug log to check seat statuses
  React.useEffect(() => {
    const bookedSeats = seats.filter(s => s.status === 'booked');
    const availableSeats = seats.filter(s => s.status === 'available');
    
    console.log('📊 SeatMap Render:', {
      total: seats.length,
      available: availableSeats.length,
      booked: bookedSeats.length,
      blockedOrOther: seats.length - availableSeats.length - bookedSeats.length,
      bookedSeatsDetails: bookedSeats.slice(0, 5).map(s => ({ number: s.number, status: s.status }))
    });
  }, [seats]);

  const isSeatSelected = (seat: Seat) => {
    return selectedSeats.some((s) => s.id === seat.id);
  };

  const canSelectSeat = (seat: Seat): boolean => {
    // ✅ Check if seat is booked or blocked
    if (seat.status === 'booked' || seat.status === 'blocked' || 
        seat.status === 'booked_male' || seat.status === 'booked_female') {
      console.log(`🔒 Seat ${seat.number} is not selectable - status: ${seat.status}`);
      return false;
    }
    return true;
  };

  const getSeatStyle = (seat: Seat) => {
    // ✅ Make sure booked seats are visually distinct
    if (seat.status === 'booked') {
      return 'bg-red-400 cursor-not-allowed opacity-60 border-red-500 text-red-900';
    }

    if (seat.status === 'blocked') {
      return 'bg-slate-400 cursor-not-allowed opacity-50 border-slate-500 text-slate-700';
    }

    if (seat.status === 'booked_male') {
      return 'bg-blue-400 cursor-not-allowed opacity-60 border-blue-500 text-blue-900';
    }

    if (seat.status === 'booked_female') {
      return 'bg-pink-400 cursor-not-allowed opacity-60 border-pink-500 text-pink-900';
    }

    if (isSeatSelected(seat)) {
      return 'bg-green-500 border-green-600 shadow-lg shadow-green-500/40 text-white font-semibold';
    }

    return 'bg-white border-green-500 hover:bg-green-50 border-2 cursor-pointer hover:shadow-md transition-all text-slate-700';
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
        title={`Seat ${seat.number} - ${seat.status} - ₹${seat.price}`}
        className={`h-14 w-14 sm:h-20 sm:w-20 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-0.5 font-bold text-xs sm:text-sm ${getSeatStyle(
          seat
        )} ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`leading-none ${isSelected ? 'text-white' : ''}`}>
          {seat.number}
        </span>
        <span className={`text-xs leading-none font-semibold ${isSelected ? 'text-white' : seat.status === 'booked' ? 'text-red-900' : seat.status === 'booked_male' ? 'text-blue-900' : seat.status === 'booked_female' ? 'text-pink-900' : 'text-green-600'}`}>
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
          const singleSeats = row.filter(s => s.col === 0);
          const doubleSeats = row.filter(s => s.col > 0);
          
          return (
            <div 
              key={`${deckName}-row-${rowIndex}`} 
              className="flex gap-2 sm:gap-6 justify-center items-center px-2 sm:px-0"
            >
              <div className="flex gap-1 sm:gap-2">
                {singleSeats.map(seat => (
                  <div key={seat.id}>
                    {renderSeatButton(seat)}
                  </div>
                ))}
              </div>

              {doubleSeats.length > 0 && singleSeats.length > 0 && (
                <div className="w-2 sm:w-4"></div>
              )}

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

  // ✅ Calculate seat statistics
  const totalSeats = seats.length;
  const availableCount = seats.filter(s => s.status === 'available').length;
  const bookedCount = seats.filter(s => s.status === 'booked').length;
  const blockedCount = seats.filter(s => s.status === 'blocked').length;
  const bookedMaleCount = seats.filter(s => s.status === 'booked_male').length;
  const bookedFemaleCount = seats.filter(s => s.status === 'booked_female').length;

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
          {lowerRows.length > 0 && renderDeck(lowerRows, 'Lower deck')}
          <div className="w-px bg-gray-300 hidden sm:block"></div>
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
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-400 border-2 border-red-500 rounded-lg flex items-center justify-center flex-shrink-0 opacity-60">
              <span className="text-xs sm:text-sm font-semibold text-red-900">X</span>
            </div>
            <div>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">Booked</p>
              <p className="text-slate-500 text-xs">Not available</p>
            </div>
          </div>

          {/* Booked Male */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-400 border-2 border-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 opacity-60">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
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
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-400 border-2 border-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 opacity-60">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-pink-900" fill="currentColor" viewBox="0 0 24 24">
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
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-400 border-2 border-slate-500 rounded-lg flex items-center justify-center flex-shrink-0 opacity-50">
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
              <p className="text-white font-semibold text-base sm:text-lg">{totalSeats}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Available</p>
              <p className="text-green-400 font-semibold text-base sm:text-lg">{availableCount}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Booked</p>
              <p className="text-red-400 font-semibold text-base sm:text-lg">{bookedCount + bookedMaleCount + bookedFemaleCount}</p>
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