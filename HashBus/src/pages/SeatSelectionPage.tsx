import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Bus, Seat } from '../types';
import { SeatMap } from '../components/SeatMap';
import { BookingSummary } from '../components/BookingSummary';
import { Button } from '../components/Button';
import { useBooking } from '../context/BookingContext';

interface SeatSelectionPageProps {
  bus: Bus;
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  onContinue: () => void;
  onBack: () => void;
  searchParams: { from: string; to: string; date: string };
}

export const SeatSelectionPage: React.FC<SeatSelectionPageProps> = ({
  bus,
  selectedSeats,
  onSeatSelect,
  onContinue,
  onBack,
  searchParams,
}) => {
  const { pickupPoint, dropPoint } = useBooking();
  const handleSeatClick = (seat: Seat) => {
    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    if (isSelected) {
      onSeatSelect(seat);
    } else if (selectedSeats.length < 6) {
      onSeatSelect(seat);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Results
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Select Your Sleeper Berths</h1>
          <p className="text-slate-400">Choose your preferred berths (Maximum 6 per booking)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 sm:p-8">
              <SeatMap
                seats={bus.seats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatClick}
              />

              <div className="mt-10 pt-8 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-5">Legend</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-800 border-2 border-slate-600 rounded-xl" />
                    <span className="text-slate-300 text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 border-2 border-amber-400 rounded-xl" />
                    <span className="text-slate-300 text-sm">Selected</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-700 border-2 border-slate-600 rounded-xl opacity-50" />
                    <span className="text-slate-300 text-sm">Booked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6">
              <BookingSummary
                bus={bus}
                selectedSeats={selectedSeats}
                journeyDate={searchParams.date}
                from={searchParams.from}
                to={searchParams.to}
                pickupPoint={pickupPoint || undefined}
                dropPoint={dropPoint || undefined}
              />

              <div className="lg:relative lg:z-20 fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent lg:bg-none lg:p-0 lg:static z-50">
                <Button
                  onClick={onContinue}
                  disabled={selectedSeats.length === 0}
                  className="w-full"
                  size="lg"
                >
                  Continue to Passenger Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
