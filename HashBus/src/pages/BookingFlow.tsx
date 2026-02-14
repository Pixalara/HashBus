import React, { useState } from 'react';
import { SearchPage } from './SearchPage';
import { SeatSelectionPage } from './SeatSelectionPage';
import { PassengerDetailsPage } from './PassengerDetailsPage';
import { PaymentPage } from './PaymentPage';
import { ConfirmationPage } from './ConfirmationPage';
import { Bus, Seat, Passenger } from '../types';

type BookingStep = 'search' | 'seats' | 'passengers' | 'payment' | 'confirmation';

export const BookingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('search');
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [searchParams, setSearchParams] = useState({ from: '', to: '', date: '' });

  console.log('📍 Current Step:', currentStep);
  console.log('🚌 Selected Bus:', selectedBus?.name);
  console.log('🪑 Selected Seats:', selectedSeats.length);
  console.log('👥 Passengers:', passengers.length);

  // Step 1: Bus Selection
  const handleBusSelect = (bus: Bus, params: { from: string; to: string; date: string }) => {
    console.log('✅ Bus selected:', bus.name);
    setSelectedBus(bus);
    setSearchParams(params);
    setCurrentStep('seats');
  };

  // Step 2: Seat Selection
  const handleSeatSelect = (seats: Seat[], firstPassenger: Passenger) => {
    console.log('✅ Seats selected:', seats.length);
    setSelectedSeats(seats);

    if (seats.length === 1) {
      // Single seat - go directly to payment
      console.log('📌 Single seat booking - skipping passenger details');
      setPassengers([firstPassenger]);
      setCurrentStep('payment');
    } else {
      // Multiple seats - go to passenger details
      console.log('📌 Multiple seats - collecting all passenger details');
      setPassengers([firstPassenger]);
      setCurrentStep('passengers');
    }
  };

  // Step 3: Multiple Passengers
  const handlePassengersSubmit = (allPassengers: Passenger[]) => {
    console.log('✅ All passengers filled:', allPassengers.length);
    setPassengers(allPassengers);
    setCurrentStep('payment');
  };

  // Step 4: Payment
  const handlePaymentComplete = () => {
    console.log('✅ Payment completed');
    setCurrentStep('confirmation');
  };

  // Reset
  const handleNewBooking = () => {
    console.log('🔄 Starting new booking');
    setCurrentStep('search');
    setSelectedBus(null);
    setSelectedSeats([]);
    setPassengers([]);
    setSearchParams({ from: '', to: '', date: '' });
  };

  const handleBack = () => {
    console.log('⬅️ Going back from:', currentStep);
    if (currentStep === 'passengers') {
      setCurrentStep('seats');
    } else if (currentStep === 'payment') {
      if (selectedSeats.length === 1) {
        setCurrentStep('seats');
      } else {
        setCurrentStep('passengers');
      }
    } else if (currentStep === 'seats') {
      setCurrentStep('search');
    }
  };

  return (
    <>
      {currentStep === 'search' && (
        <SearchPage onBusSelect={handleBusSelect} />
      )}

      {currentStep === 'seats' && selectedBus && (
        <SeatSelectionPage
          bus={selectedBus}
          searchParams={searchParams}
          onSeatSelect={handleSeatSelect}
          onBack={handleBack}
        />
      )}

      {currentStep === 'passengers' && selectedBus && selectedSeats.length > 1 && (
        <PassengerDetailsPage
          bus={selectedBus}
          selectedSeats={selectedSeats}
          onContinue={handlePassengersSubmit}
          onBack={handleBack}
          searchParams={searchParams}
        />
      )}

      {currentStep === 'payment' && selectedBus && passengers.length > 0 && (
        <PaymentPage
          bus={selectedBus}
          selectedSeats={selectedSeats}
          passenger={passengers[0]}
          searchParams={searchParams}
          onPaymentComplete={handlePaymentComplete}
          onBack={handleBack}
        />
      )}

      {currentStep === 'confirmation' && selectedBus && (
        <ConfirmationPage
          booking={{
            id: selectedBus.id,
            bookingNumber: `HB${Date.now()}`,
            bus: selectedBus,
            selectedSeats,
            passenger: passengers[0],
            passengers,
            totalAmount: selectedSeats.reduce((sum, s) => sum + s.price, 0),
            paymentStatus: 'completed',
            journeyDate: searchParams.date,
            route: {
              from: { name: searchParams.from },
              to: { name: searchParams.to },
            },
            pickupPoint: { name: 'Pickup Point' },
            dropPoint: { name: 'Drop Point' },
          }}
          onNewBooking={handleNewBooking}
        />
      )}
    </>
  );
};