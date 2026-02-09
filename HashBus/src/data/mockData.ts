import { City, Bus, Seat, Route } from '../types';

export const cities: City[] = [
  { id: 'blr', name: 'Bengaluru' },
  { id: 'hyd', name: 'Hyderabad' },
];

export const routes: Route[] = [
  {
    id: 'blr-hyd',
    from: cities[0],
    to: cities[1],
  },
  {
    id: 'hyd-blr',
    from: cities[1],
    to: cities[0],
  },
];

const generateSeats = (basePrice: number): Seat[] => {
  const seats: Seat[] = [];

  for (let i = 1; i <= 30; i++) {
    const isUpper = i % 2 === 0;
    seats.push({
      id: `seat-${i}`,
      number: `${isUpper ? 'U' : 'L'}${Math.ceil(i / 2)}`,
      position: isUpper ? 'upper' : 'lower',
      status: Math.random() > 0.7 ? 'booked' : 'available',
      price: isUpper ? basePrice : basePrice + 100,
    });
  }

  return seats;
};

export const buses: Bus[] = [
  {
    id: 'bus-1',
    name: 'HashBus Volvo Executive',
    coachType: 'Volvo',
    departureTime: '22:00',
    arrivalTime: '06:30',
    duration: '8h 30m',
    availableSeats: 18,
    basePrice: 1499,
    amenities: ['WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'Reading Light', 'Emergency Exit'],
    rating: 4.8,
    seats: generateSeats(1499),
  },
  {
    id: 'bus-2',
    name: 'HashBus Bharat Benz Luxury',
    coachType: 'Bharat Benz',
    departureTime: '23:00',
    arrivalTime: '07:30',
    duration: '8h 30m',
    availableSeats: 22,
    basePrice: 1299,
    amenities: ['WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'Reading Light'],
    rating: 4.6,
    seats: generateSeats(1299),
  },
  {
    id: 'bus-3',
    name: 'HashBus Volvo Premium',
    coachType: 'Volvo',
    departureTime: '21:30',
    arrivalTime: '06:00',
    duration: '8h 30m',
    availableSeats: 15,
    basePrice: 1599,
    amenities: ['WiFi', 'Charging Point', 'Blanket', 'Pillow', 'Water Bottle', 'Snack Box', 'Reading Light', 'Premium Recline'],
    rating: 4.9,
    seats: generateSeats(1599),
  },
  {
    id: 'bus-4',
    name: 'HashBus Bharat Benz Sleeper',
    coachType: 'Bharat Benz',
    departureTime: '20:00',
    arrivalTime: '04:30',
    duration: '8h 30m',
    availableSeats: 24,
    basePrice: 1199,
    amenities: ['WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'Reading Light'],
    rating: 4.5,
    seats: generateSeats(1199),
  },
  {
    id: 'bus-5',
    name: 'HashBus Volvo Ultra Luxury',
    coachType: 'Volvo',
    departureTime: '22:30',
    arrivalTime: '07:00',
    duration: '8h 30m',
    availableSeats: 12,
    basePrice: 1799,
    amenities: ['WiFi', 'Charging Point', 'Blanket', 'Pillow', 'Water Bottle', 'Gourmet Snack Box', 'Reading Light', 'Premium Recline', 'Personal Screen'],
    rating: 5.0,
    seats: generateSeats(1799),
  },
  {
    id: 'bus-6',
    name: 'HashBus Bharat Benz Premium',
    coachType: 'Bharat Benz',
    departureTime: '23:30',
    arrivalTime: '08:00',
    duration: '8h 30m',
    availableSeats: 20,
    basePrice: 1399,
    amenities: ['WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'Snack', 'Reading Light'],
    rating: 4.7,
    seats: generateSeats(1399),
  },
];
