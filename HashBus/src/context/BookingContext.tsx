import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Bus, Seat, SearchParams, Passenger, Booking, Location } from '../types';

interface BookingContextType {
  searchParams: SearchParams | null;
  setSearchParams: (params: SearchParams) => void;
  selectedBus: Bus | null;
  setSelectedBus: (bus: Bus) => void;
  pickupPoint: Location | null;
  setPickupPoint: (location: Location) => void;
  dropPoint: Location | null;
  setDropPoint: (location: Location) => void;
  selectedSeats: Seat[];
  setSelectedSeats: (seats: Seat[]) => void;
  passenger: Passenger | null;
  setPassenger: (passenger: Passenger) => void;
  booking: Booking | null;
  setBooking: (booking: Booking) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [pickupPoint, setPickupPoint] = useState<Location | null>(null);
  const [dropPoint, setDropPoint] = useState<Location | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [passenger, setPassenger] = useState<Passenger | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const resetBooking = () => {
    setSearchParams(null);
    setSelectedBus(null);
    setPickupPoint(null);
    setDropPoint(null);
    setSelectedSeats([]);
    setPassenger(null);
    setBooking(null);
  };

  return (
    <BookingContext.Provider
      value={{
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
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
