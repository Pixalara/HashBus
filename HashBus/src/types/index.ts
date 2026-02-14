export interface Bus {
  id: string;
  name: string;
  number?: string;
  coachType: string;
  totalSeats: number;
  availableSeats: number;
  basePrice: number;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  rating: number;
  amenities: string[];
  trip_id?: string;
  pickup_points?: string[];
  drop_points?: string[];
  seats?: Seat[];
  pricing?: any;
}

export interface Seat {
  id: string;
  number: string;
  row: number;
  col: number;
  deck: 'upper' | 'lower';
  type?: string;
  is_single?: boolean;
  isSingle?: boolean;
  price: number;
  status: 'available' | 'booked' | 'blocked' | 'booked_male' | 'booked_female';
}

export interface Passenger {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  email: string;
}

export interface Location {
  id?: string;
  name: string;
  address?: string;
  city?: string;
}

export interface Route {
  id: string;
  from: Location;
  to: Location;
  distance?: number;
  duration?: string;
}

export interface SearchParams {
  from: string;
  to: string;
  date: string;
}

export interface Booking {
  id: string;
  bus: Bus;
  selectedSeats: Seat[];
  passenger: Passenger;
  passengers?: Passenger[];
  totalAmount: number;
  bookingDate: string;
  journeyDate: string;
  route: Route;
  pickupPoint: Location;
  dropPoint: Location;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}