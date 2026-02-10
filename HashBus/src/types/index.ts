export interface City {
  id: string;
  name: string;
}

export interface Route {
  id: string;
  from: City;
  to: City;
}

export interface Location {
  id: string;
  name: string;
  city: string;
}

export type CoachType = 'Bharat Benz' | 'Volvo';
export type SeatStatus = 'available' | 'selected' | 'booked' | 'blocked';

export interface Seat {
  id: string;
  number: string;
  row: number;
  col: number;
  status: SeatStatus;
  price: number;
}

export interface Bus {
  id: string;
  name: string;
  number?: string;
  coachType: CoachType | string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableSeats?: number;
  totalSeats?: number;
  basePrice: number;
  amenities: string[];
  rating: number;
  seats?: Seat[];
  trip_id?: string;
  pickup_points?: any[];
  drop_points?: any[];
}

export interface SearchParams {
  from: string;
  to: string;
  date: string;
}

export interface Passenger {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  email: string;
}

export interface Booking {
  id: string;
  bus: Bus;
  selectedSeats: Seat[];
  passenger: Passenger;
  totalAmount: number;
  bookingDate: string;
  journeyDate: string;
  route: Route;
  pickupPoint: Location;
  dropPoint: Location;
}

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';
