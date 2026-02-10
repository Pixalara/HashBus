import React, { useState } from 'react';
import { BookingProvider, useBooking } from './context/BookingContext';
import { ToastProvider } from './components/Toast';
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
import { buses, routes } from './data/mockData';
import { Bus, Seat, Passenger, Booking, Location } from './types';
import { generateBookingId } from './utils/formatters';

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
  | 'admin-dashboard';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
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

  const handleSearch = (from: string, to: string, date: string) => {
    setSearchParams({ from, to, date });
    setCurrentPage('search');
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
    if (page === 'home' || page === 'fleet' || page === 'about' || page === 'contact' || page === 'admin-dashboard') {
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
            buses={buses}
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
