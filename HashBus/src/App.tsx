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
    booking,
    setBooking,
    resetBooking,
  } = useBooking();

  const handleSearch = async (from: string, to: string, date: string) => {
    setSearchParams({ from, to, date });
    setIsSearching(true);
    try {
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
          pickup_points,
          drop_points,
          buses(id, name, bus_number, bus_type, total_seats)
        `)
        .eq('source', from)
        .eq('destination', to)
        .gte('departure_time', `${date}T00:00:00`)
        .lte('departure_time', `${date}T23:59:59`);

      if (error) throw error;

      const formattedBuses: Bus[] = await Promise.all((trips || []).map(async (trip: any) => {
        const { data: seats, error: seatsError } = await supabase
          .from('seats')
          .select('*')
          .eq('bus_id', trip.bus_id);

        if (seatsError) {
          console.error('Error fetching seats:', seatsError);
        }

        // Get booked seats for this specific trip and date
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('seats')
          .eq('trip_id', trip.id)
          .eq('journey_date', date);

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
        }

        // Flatten all booked seat numbers
        const bookedSeatNumbers = new Set(
          (bookings || []).flatMap((booking: any) => booking.seats || [])
        );

        const formattedSeats: Seat[] = (seats || []).map((seat: any) => ({
          id: seat.id,
          number: seat.seat_number,
          row: Math.floor((parseInt(seat.seat_number) - 1) / 4),
          col: (parseInt(seat.seat_number) - 1) % 4,
          status: seat.is_blocked || bookedSeatNumbers.has(seat.seat_number) ? 'blocked' : 'available',
          price: parseFloat(trip.base_price),
        }));

        const availableSeats = formattedSeats.filter(s => s.status === 'available').length;

        return {
          id: trip.id,
          name: trip.buses?.name || 'Unknown Bus',
          number: trip.buses?.bus_number || 'N/A',
          coachType: trip.buses?.bus_type || 'Luxury Sleeper',
          totalSeats: trip.buses?.total_seats || 40,
          availableSeats,
          basePrice: parseFloat(trip.base_price),
          departureTime: new Date(trip.departure_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          arrivalTime: new Date(trip.arrival_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          duration: calculateDuration(trip.departure_time, trip.arrival_time),
          rating: 4.5,
          amenities: ['WiFi', 'AC', 'Charging Point'],
          trip_id: trip.id,
          pickup_points: trip.pickup_points || [],
          drop_points: trip.drop_points || [],
          seats: formattedSeats,
        };
      }));

      setSearchResults(formattedBuses);
      setCurrentPage('search');
    } catch (error: any) {
      showToast(error.message || 'Failed to search trips', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const calculateDuration = (departure: string, arrival: string): string => {
    const dept = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dept.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleSelectBus = (bus: Bus) => {
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
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleContinueToPassenger = () => {
    setCurrentPage('passenger');
  };

  const handlePassengerSubmit = (passengerData: Passenger) => {
    setPassenger(passengerData);
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
          totalAmount: total,
          bookingDate: new Date().toISOString(),
          journeyDate: searchParams.date,
          route,
          pickupPoint,
          dropPoint,
        };

        setBooking(newBooking);
        setCurrentPage('confirmation');
      }
    }
  };

  const handleNewBooking = () => {
    resetBooking();
    setCurrentPage('home');
  };

  const handleNavigation = (page: string) => {
    if (page === 'home' || page === 'fleet' || page === 'about' || page === 'contact' || page === 'admin-dashboard' || page === 'dashboard') {
      setCurrentPage(page as Page);
    }
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
            onSeatSelect={handleSeatSelect}
            onContinue={handleContinueToPassenger}
            onBack={() => setCurrentPage('pickupDrop')}
            searchParams={searchParams}
          />
        );

      case 'passenger':
        if (
          !selectedBus ||
          !selectedSeats.length ||
          !searchParams ||
          !pickupPoint ||
          !dropPoint
        )
          return <HomePage onSearch={handleSearch} />;
        return (
          <PassengerDetailsPage
            bus={selectedBus}
            selectedSeats={selectedSeats}
            onContinue={handlePassengerSubmit}
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
      <Footer />
    </div>
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
