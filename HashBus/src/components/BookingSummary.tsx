import React from 'react';
import { Bus, Calendar, Clock, MapPin, Users, Navigation } from 'lucide-react';
import { Bus as BusType, Seat, Location } from '../types';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';

interface BookingSummaryProps {
  bus: BusType;
  selectedSeats: Seat[];
  journeyDate: string;
  from: string;
  to: string;
  pickupPoint?: Location;
  dropPoint?: Location;
  showPriceBreakdown?: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  bus,
  selectedSeats,
  journeyDate,
  from,
  to,
  pickupPoint,
  dropPoint,
  showPriceBreakdown = false,
}) => {
  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + taxes;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-6 sticky top-24 z-10">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Booking Summary</h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Bus className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-white font-semibold">{bus.name}</p>
              <p className="text-slate-400 text-sm">{bus.coachType}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-white font-medium">{from} → {to}</p>
            </div>
          </div>

          {pickupPoint && dropPoint && (
            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-white text-sm">
                  <span className="text-slate-400">Pickup:</span> {pickupPoint.name}
                </p>
                <p className="text-white text-sm">
                  <span className="text-slate-400">Drop:</span> {dropPoint.name}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-white">{formatDate(journeyDate)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-white">
                {formatTime(bus.departureTime)} - {formatTime(bus.arrivalTime)}
              </p>
              <p className="text-slate-400 text-sm">{bus.duration}</p>
            </div>
          </div>

          {selectedSeats.length > 0 && (
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-white font-medium">Selected Seats</p>
                <p className="text-slate-400 text-sm">
                  {selectedSeats.map((s) => s.number).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="border-t border-slate-700 pt-6 space-y-3">
          {showPriceBreakdown ? (
            <>
              <div className="flex justify-between text-slate-300">
                <span>Base Fare ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Taxes & Fees</span>
                <span>{formatCurrency(taxes)}</span>
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-white">Total Amount</span>
                <span className="text-2xl font-bold text-amber-500">{formatCurrency(total)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-white">Total</span>
              <span className="text-2xl font-bold text-amber-500">{formatCurrency(total)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
