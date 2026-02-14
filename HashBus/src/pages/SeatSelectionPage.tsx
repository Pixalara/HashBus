import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Users } from 'lucide-react';
import { Bus, Seat } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from '../components/Button';
import { SeatMap } from '../components/SeatMap';
import { supabase } from '../lib/supabase';

interface SeatSelectionPageProps {
  bus: Bus;
  selectedSeats: Seat[];
  searchParams: { from: string; to: string; date: string };
  onSeatSelect: (seat: Seat) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const SeatSelectionPage: React.FC<SeatSelectionPageProps> = ({
  bus,
  selectedSeats,
  searchParams,
  onSeatSelect,
  onContinue,
  onBack,
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(true);
  const [currentBus, setCurrentBus] = useState<Bus>(bus);

  // ✅ Fetch fresh seats from database when component mounts
  useEffect(() => {
    const fetchFreshSeats = async () => {
      try {
        setSeatsLoading(true);
        console.log('🔄 Fetching fresh seats for bus:', bus.id);

        const { data, error } = await supabase
          .from('seats')
          .select('*')
          .eq('bus_id', bus.id)
          .order('seat_number', { ascending: true });

        if (error) {
          console.error('❌ Error fetching seats:', error);
          throw error;
        }

        if (data) {
          console.log('✅ Fresh seats fetched:', {
            total: data.length,
            available: data.filter(s => s.status === 'available').length,
            booked: data.filter(s => s.status === 'booked').length,
            bookedSeats: data
              .filter(s => s.status === 'booked')
              .map(s => s.seat_number),
          });

          const formattedSeats: Seat[] = data.map(seat => ({
            id: seat.id,
            number: String(seat.seat_number),
            row: seat.row,
            col: seat.col,
            deck: seat.deck,
            isSingle: seat.is_single,
            price: seat.price || 0,
            status: seat.status || 'available',
          }));

          setSeats(formattedSeats);

          // ✅ Update currentBus with fresh seat data
          setCurrentBus({
            ...bus,
            seats: formattedSeats,
            totalSeats: formattedSeats.length,
            availableSeats: formattedSeats.filter(s => s.status === 'available').length,
          });
        }
      } catch (error) {
        console.error('❌ Error fetching seats:', error);
      } finally {
        setSeatsLoading(false);
      }
    };

    fetchFreshSeats();

    // ✅ Poll every 5 seconds for real-time updates
    const interval = setInterval(fetchFreshSeats, 5000);

    return () => clearInterval(interval);
  }, [bus.id, bus]);

  // ✅ Refresh seats when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📱 Page is visible - refreshing seats immediately');
        const fetchSeatsQuick = async () => {
          try {
            const { data, error } = await supabase
              .from('seats')
              .select('*')
              .eq('bus_id', bus.id)
              .order('seat_number', { ascending: true });

            if (!error && data) {
              const formattedSeats: Seat[] = data.map(seat => ({
                id: seat.id,
                number: String(seat.seat_number),
                row: seat.row,
                col: seat.col,
                deck: seat.deck,
                isSingle: seat.is_single,
                price: seat.price || 0,
                status: seat.status || 'available',
              }));

              setSeats(formattedSeats);

              // ✅ Update currentBus with fresh data
              setCurrentBus({
                ...bus,
                seats: formattedSeats,
                totalSeats: formattedSeats.length,
                availableSeats: formattedSeats.filter(s => s.status === 'available').length,
              });

              console.log('✅ Seats refreshed on visibility change:', {
                booked: formattedSeats.filter(s => s.status === 'booked').length,
                available: formattedSeats.filter(s => s.status === 'available').length,
              });
            }
          } catch (error) {
            console.error('Error refreshing seats:', error);
          }
        };
        fetchSeatsQuick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [bus.id, bus]);

  const handleContinueClick = () => {
    console.log('📋 Continue button clicked');
    console.log('Selected seats:', selectedSeats.length);

    if (selectedSeats.length === 0) {
      console.log('❌ No seats selected');
      alert('Please select at least one seat');
      return;
    }

    console.log('✅ Moving to passenger details page');
    onContinue();
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const taxes = Math.round(totalPrice * 0.05);

  // ✅ Show current bus info
  const bookedSeatsCount = seats.filter(s => s.status === 'booked').length;
  const availableSeatsCount = seats.filter(s => s.status === 'available').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Search
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Select Your Seats</h1>
          <p className="text-slate-400">Choose your preferred sleeper berths</p>
          {/* ✅ Show seat status */}
          <p className="text-amber-400 text-sm mt-2">
            Total: {currentBus.totalSeats} | Available: {availableSeatsCount} | Booked: {bookedSeatsCount}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Journey Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">Journey Information</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-slate-400 text-sm">Route</p>
                    <p className="text-white font-medium">
                      {searchParams.from} → {searchParams.to}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-slate-400 text-sm">Date</p>
                    <p className="text-white font-medium">{formatDate(searchParams.date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-slate-400 text-sm">Departure</p>
                    <p className="text-white font-medium">{currentBus.departureTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-slate-400 text-sm">Bus</p>
                    <p className="text-white font-medium">{currentBus.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Map */}
            {seatsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white text-lg">Loading seats...</p>
                </div>
              </div>
            ) : seats.length > 0 ? (
              <SeatMap
                seats={seats}
                selectedSeats={selectedSeats}
                onSeatSelect={onSeatSelect}
                userGender="Other"
              />
            ) : (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <p className="text-white text-lg">No seats available</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-6 sticky top-24">
              <h3 className="text-lg font-bold text-white">Booking Summary</h3>

              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-700">
                  <p className="text-white font-semibold mb-1">{currentBus.name}</p>
                  <p className="text-slate-400 text-sm">Luxury Sleeper</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pickup</span>
                    <span className="text-white font-medium">Majestic</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Drop</span>
                    <span className="text-white font-medium">Kukatpally</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date</span>
                    <span className="text-white font-medium">{formatDate(searchParams.date)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4 space-y-4">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Selected Seats</p>
                  {selectedSeats.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map(seat => (
                        <span
                          key={seat.id}
                          className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-300 text-sm font-medium"
                        >
                          {seat.number}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No seats selected</p>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Seats ({selectedSeats.length})</span>
                    <span className="text-white font-medium">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Taxes</span>
                    <span className="text-white font-medium">{formatCurrency(taxes)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-2xl font-bold text-amber-500">
                      {formatCurrency(totalPrice + taxes)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleContinueClick}
                  disabled={selectedSeats.length === 0}
                  size="lg"
                  className="w-full mt-6"
                >
                  Continue to Passenger Details ({selectedSeats.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};