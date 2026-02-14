import React, { useState } from 'react';
import { BookingProvider, useBooking } from './context/BookingContext';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { PickupDropPage } from './pages/PickupDropPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { PassengerDetailsPage } from './pages/PassengerDetailsPage';
import { PaymentPage } from './pages/PaymentPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { FleetPage } from './pages/FleetPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import UserDashboardPage from './pages/UserDashboardPage';
import { routes } from './data/mockData';
import { Bus, Seat, Passenger, Booking, Location } from './types';
import { generateBookingId } from './utils/formatters';
import { supabase } from './lib/supabase';

type Page =
  | 'home'
  | 'search'
  | 'pickupDrop'
  | 'seats'
  | 'passenger'
  | 'payment'
  | 'confirmation'
  | 'fleet'
  | 'about'
  | 'contact'
  | 'admin-dashboard'
  | 'dashboard';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [searchResults, setSearchResults] = useState<Bus[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { showToast } = useToast();
  const {
    searchParams,
    setSearchParams,
    selectedBus,
    setSelectedBus,
    pickupPoint,
    setPickupPoint,
    dropPoint,
    setDropPoint,
    selectedSeats,
    setSelectedSeats,
    passenger,
    setPassenger,
    passengers,
    setPassengers,
    booking,
    setBooking,
    resetBooking,
  } = useBooking();

  const formatTime12Hour = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  const calculateDuration = (departure: string, arrival: string): string => {
    const depTime = departure.split('T')[1]?.substring(0, 5) || '00:00';
    const arrTime = arrival.split('T')[1]?.substring(0, 5) || '00:00';
    const depDate = departure.split('T')[0];
    const arrDate = arrival.split('T')[0];

    const [depHours, depMinutes] = depTime.split(':').map(Number);
    const [arrHours, arrMinutes] = arrTime.split(':').map(Number);

    let depTotalMinutes = depHours * 60 + depMinutes;
    let arrTotalMinutes = arrHours * 60 + arrMinutes;

    if (arrDate > depDate) {
      arrTotalMinutes += 24 * 60;
    }

    const diffMinutes = arrTotalMinutes - depTotalMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const handleSearch = async (from: string, to: string, date: string) => {
    setSearchParams({ from, to, date });
    setIsSearching(true);
    try {
      console.log('🔍 Search Parameters:', { from, to, date });

      const { data: trips, error } = await supabase
        .from('trips')
        .select(`
          id,
          bus_id,
          source,
          destination,
          departure_time,
          arrival_time,
          base_price,
          pricing,
          pickup_points,
          drop_points,
          buses(
            id, 
            name, 
            bus_number, 
            bus_type, 
            total_seats,
            seats(
              id,
              seat_number,
              row,
              col,
              deck,
              is_single,
              is_blocked,
              price,
              status
            )
          )
        `)
        .eq('source', from)
        .eq('destination', to);

      if (error) throw error;

      console.log('📋 All trips fetched:', trips?.length || 0);

      if (!trips || trips.length === 0) {
        showToast('No trips found for this route', 'info');
        setSearchResults([]);
        setCurrentPage('search');
        return;
      }

      const searchDateNormalized = date;
      console.log('📅 Normalized search date:', searchDateNormalized);

      const filteredTrips = trips.filter((trip: any) => {
        const tripDatePart = trip.departure_time.split('T')[0];
        const matches = tripDatePart === searchDateNormalized;
        return matches;
      });

      console.log('✅ Filtered trips:', filteredTrips.length);

      if (filteredTrips.length === 0) {
        showToast('No trips available for the selected date', 'info');
        setSearchResults([]);
        setCurrentPage('search');
        return;
      }

      const formattedBuses: Bus[] = filteredTrips.map((trip: any) => {
        const dbSeats = trip.buses?.seats || [];

        const formattedSeats: Seat[] = dbSeats.map((seat: any) => ({
          id: seat.id,
          number: seat.seat_number,
          row: seat.row,
          col: seat.col,
          deck: seat.deck as 'upper' | 'lower',
          type: 'sleeper' as const,
          is_single: seat.is_single || false,
          status: seat.is_blocked || seat.status === 'booked' ? 'booked' : 'available',
          price: seat.price || parseFloat(trip.base_price),
        }));

        const totalSeats = formattedSeats.length;
        const availableSeats = formattedSeats.filter(s => s.status === 'available').length;

        console.log('📊 Seat calculation:', {
          bus: trip.buses?.name,
          total: totalSeats,
          available: availableSeats,
          booked: totalSeats - availableSeats,
        });

        const depTimePart = trip.departure_time.split('T')[1]?.substring(0, 5) || '00:00';
        const arrTimePart = trip.arrival_time.split('T')[1]?.substring(0, 5) || '00:00';

        return {
          id: trip.bus_id,
          name: trip.buses?.name || 'Unknown Bus',
          number: trip.buses?.bus_number || 'N/A',
          coachType: trip.buses?.bus_type || 'Luxury Sleeper',
          totalSeats: totalSeats,
          availableSeats: availableSeats,
          basePrice: parseFloat(trip.base_price),
          departureTime: formatTime12Hour(depTimePart),
          arrivalTime: formatTime12Hour(arrTimePart),
          duration: calculateDuration(trip.departure_time, trip.arrival_time),
          rating: 4.5,
          amenities: ['WiFi', 'AC', 'Charging Point'],
          trip_id: trip.id,
          pickup_points: trip.pickup_points || [],
          drop_points: trip.drop_points || [],
          seats: formattedSeats,
          pricing: trip.pricing,
        };
      });

      console.log('🚌 Formatted buses:', formattedBuses.length);

      setSearchResults(formattedBuses);
      setCurrentPage('search');
    } catch (error: any) {
      console.error('❌ Search error:', error);
      showToast(error.message || 'Failed to search trips', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBus = (bus: Bus) => {
    console.log('🎫 Bus selected:', bus.name);
    setSelectedBus(bus);
    setSelectedSeats([]);
    setCurrentPage('pickupDrop');
  };

  const handlePickupDropSelect = (pickup: Location, drop: Location) => {
    setPickupPoint(pickup);
    setDropPoint(drop);
    setCurrentPage('seats');
  };

  const handleSeatSelect = (seat: Seat) => {
    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 6) {
        showToast('Maximum 6 seats can be selected', 'warning');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleContinueToPassenger = () => {
    console.log('📋 Continuing to passenger details, seats:', selectedSeats.length);
    if (selectedSeats.length === 0) {
      showToast('Please select at least one seat', 'warning');
      return;
    }
    setCurrentPage('passenger');
  };

  const handlePassengerSubmit = (passengerData: Passenger) => {
    console.log('👤 Passenger submitted:', passengerData.name);
    setPassenger(passengerData);
    setPassengers([passengerData]);
    setCurrentPage('payment');
  };

  const handlePassengersSubmit = (allPassengers: Passenger[]) => {
    console.log('👥 All passengers submitted:', allPassengers.length);
    setPassenger(allPassengers[0]);
    setPassengers(allPassengers);
    setCurrentPage('payment');
  };

  const handlePaymentComplete = () => {
    if (
      selectedBus &&
      selectedSeats.length > 0 &&
      passenger &&
      searchParams &&
      pickupPoint &&
      dropPoint
    ) {
      const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
      const taxes = Math.round(subtotal * 0.05);
      const total = subtotal + taxes;

      const route = routes.find(
        (r) => r.from.name === searchParams.from && r.to.name === searchParams.to
      );

      if (route) {
        const newBooking: Booking = {
          id: generateBookingId(),
          bus: selectedBus,
          selectedSeats,
          passenger,
          passengers: passengers.length > 0 ? passengers : [passenger],
          totalAmount: total,
          bookingDate: new Date().toISOString(),
          journeyDate: searchParams.date,
          route,
          pickupPoint,
          dropPoint,
        };

        console.log('✅ Booking created:', {
          id: newBooking.id,
          passengers: newBooking.passengers?.length || 1,
          seats: newBooking.selectedSeats.map(s => s.number),
        });

        setBooking(newBooking);
        setCurrentPage('confirmation');
      }
    }
  };

  // ✅ COMPLETE RESET when returning from confirmation
  const handleNewBooking = () => {
    console.log('🔄 Booking completed, performing complete reset...');

    // Reset ALL booking state
    resetBooking();
    setSelectedBus(null);
    setSelectedSeats([]);
    setPickupPoint(null);
    setDropPoint(null);
    setPassenger(null);
    setPassengers([]);
    setSearchParams(null);
    setSearchResults([]); // ✅ Clear all search results

    console.log('✅ Complete reset done, returning to home');
    setCurrentPage('home');
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page as Page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onSearch={handleSearch} />;

      case 'search':
        if (!searchParams) return <HomePage onSearch={handleSearch} />;
        return (
          <SearchResultsPage
            buses={searchResults}
            searchParams={searchParams}
            onSelectBus={handleSelectBus}
            onBack={() => setCurrentPage('home')}
          />
        );

      case 'pickupDrop':
        if (!selectedBus || !searchParams) return <HomePage onSearch={handleSearch} />;
        return (
          <PickupDropPage
            from={searchParams.from}
            to={searchParams.to}
            onContinue={handlePickupDropSelect}
            onBack={() => setCurrentPage('search')}
          />
        );

      case 'seats':
        if (!selectedBus || !searchParams || !pickupPoint || !dropPoint)
          return <HomePage onSearch={handleSearch} />;
        return (
          <SeatSelectionPage
            bus={selectedBus}
            selectedSeats={selectedSeats}
            searchParams={searchParams}
            onSeatSelect={handleSeatSelect}
            onContinue={handleContinueToPassenger}
            onBack={() => setCurrentPage('pickupDrop')}
          />
        );

      case 'passenger':
        if (!selectedBus || !selectedSeats.length || !searchParams)
          return <HomePage onSearch={handleSearch} />;
        return (
          <PassengerDetailsPage
            bus={selectedBus}
            selectedSeats={selectedSeats}
            onContinue={selectedSeats.length === 1 ? handlePassengerSubmit : handlePassengersSubmit}
            onBack={() => setCurrentPage('seats')}
            searchParams={searchParams}
          />
        );

      case 'payment':
        if (
          !selectedBus ||
          !selectedSeats.length ||
          !passenger ||
          !searchParams ||
          !pickupPoint ||
          !dropPoint
        )
          return <HomePage onSearch={handleSearch} />;
        return (
          <PaymentPage
            bus={selectedBus}
            selectedSeats={selectedSeats}
            passenger={passenger}
            searchParams={searchParams}
            onPaymentComplete={handlePaymentComplete}
            onBack={() => setCurrentPage('passenger')}
          />
        );

      case 'confirmation':
        if (!booking) return <HomePage onSearch={handleSearch} />;
        return <ConfirmationPage booking={booking} onNewBooking={handleNewBooking} />;

      case 'fleet':
        return <FleetPage />;

      case 'about':
        return <AboutPage />;

      case 'contact':
        return <ContactPage />;

      case 'admin-dashboard':
        return <AdminDashboardPage onNavigate={handleNavigation} />;

      case 'dashboard':
        return <UserDashboardPage />;

      default:
        return <HomePage onSearch={handleSearch} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage={currentPage} onNavigate={handleNavigation} />
      <main className="flex-1">{renderPage()}</main>
<Footer onNavigate={handleNavigation} />    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <BookingProvider>
        <AppContent />
      </BookingProvider>
    </ToastProvider>
  );
}

export default App;