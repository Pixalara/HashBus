import React, { useState } from 'react';
import { SearchPage } from './SearchPage';
import { SeatSelectionPage } from './SeatSelectionPage';
import { PassengerDetailsPage } from './PassengerDetailsPage';
import { PaymentPage } from './PaymentPage';
import { ConfirmationPage } from './ConfirmationPage';
import { Bus, Seat, Passenger, Booking } from '../types';

type Step = 'search' | 'seats' | 'passengers' | 'payment' | 'confirmation';

export const BookingPage: React.FC = () => {
  const [step, setStep] = useState<Step>('search');
  const [bus, setBus] = useState<Bus | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [params, setParams] = useState({ from: '', to: '', date: '' });
  const [booking, setBooking] = useState<Booking | null>(null);

  // Search → Select Bus → Go to Seats
  const handleSearch = (selectedBus: Bus, searchParams: { from: string; to: string; date: string }) => {
    console.log('🔍 Search: Selected bus', selectedBus.name);
    setBus(selectedBus);
    setParams(searchParams);
    setStep('seats');
  };

  // Seats → Fill Passenger Details
  const handleSeatsSelected = (selectedSeats: Seat[], firstPassenger: Passenger) => {
    console.log('🪑 Seats:', selectedSeats.length, 'seats selected');
    setSeats(selectedSeats);
    
    if (selectedSeats.length === 1) {
      // Single seat - go to payment
      console.log('→ Single seat, going to payment');
      setPassengers([firstPassenger]);
      setStep('payment');
    } else {
      // Multiple seats - go to passenger details
      console.log('→ Multiple seats, going to passenger details');
      setPassengers([firstPassenger]);
      setStep('passengers');
    }
  };

  // Passengers → Payment
  const handlePassengersSubmit = (allPassengers: Passenger[]) => {
    console.log('👥 Passengers:', allPassengers.length, 'passengers submitted');
    setPassengers(allPassengers);
    setStep('payment');
  };

  // Payment → Confirmation
  const handlePaymentSuccess = () => {
    console.log('💳 Payment successful, going to confirmation');
    if (bus && seats.length > 0 && passengers.length > 0) {
      const newBooking: Booking = {
        id: `booking_${Date.now()}`,
        bookingNumber: `HB${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        bus,
        selectedSeats: seats,
        passenger: passengers[0],
        passengers,
        totalAmount: seats.reduce((sum, s) => sum + s.price, 0),
        paymentStatus: 'completed',
        journeyDate: params.date,
        route: {
          from: { name: params.from },
          to: { name: params.to },
        },
        pickupPoint: { name: 'Pickup Point' },
        dropPoint: { name: 'Drop Point' },
      };
      setBooking(newBooking);
      setStep('confirmation');
    }
  };

  // New Booking
  const handleNewBooking = () => {
    console.log('🔄 Starting new booking');
    setStep('search');
    setBus(null);
    setSeats([]);
    setPassengers([]);
    setParams({ from: '', to: '', date: '' });
    setBooking(null);
  };

  // Back
  const handleBack = () => {
    console.log('⬅️ Back from:', step);
    if (step === 'passengers') {
      setStep('seats');
    } else if (step === 'payment') {
      setStep(seats.length === 1 ? 'seats' : 'passengers');
    } else if (step === 'seats') {
      setStep('search');
    }
  };

  return (
    <div>
      {step === 'search' && (
        <SearchPage onBusSelect={handleSearch} />
      )}

      {step === 'seats' && bus && (
        <SeatSelectionPage
          bus={bus}
          searchParams={params}
          onSeatSelect={handleSeatsSelected}
          onBack={handleBack}
        />
      )}

      {step === 'passengers' && bus && seats.length > 0 && (
        <PassengerDetailsPage
          bus={bus}
          selectedSeats={seats}
          onContinue={handlePassengersSubmit}
          onBack={handleBack}
          searchParams={params}
        />
      )}

      {step === 'payment' && bus && seats.length > 0 && passengers.length > 0 && (
        <PaymentPage
          bus={bus}
          selectedSeats={seats}
          passenger={passengers[0]}
          searchParams={params}
          onPaymentComplete={handlePaymentSuccess}
          onBack={handleBack}
        />
      )}

      {step === 'confirmation' && booking && (
        <ConfirmationPage
          booking={booking}
          onNewBooking={handleNewBooking}
        />
      )}
    </div>
  );
};