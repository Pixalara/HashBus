import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';

interface Bus {
  id: string;
  name: string;
  number?: string;
  bus_type?: string;
  coach_type: string;
  total_seats: number;
  amenities: string[];
  is_active?: boolean;
  created_at: string;
  seats?: any[];
}

interface Trip {
  id: string;
  bus_id: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  base_price: number;
  journey_date: string;
  status: string;
  pickup_points: any[];
  drop_points: any[];
  buses?: Bus;
  pricing?: {
    lower_double_sleeper: number;
    lower_single_sleeper: number;
    upper_double_sleeper: number;
    upper_single_sleeper: number;
  };
}

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'flat' | 'percentage';
  discount_value: number;
  min_booking_amount: number;
  max_discount: number | null;
  valid_from: string;
  valid_until: string;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
}

interface Booking {
  id: string;
  booking_number: string;
  user_id: string;
  trip_id: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_status: string;
  booking_status: string;
  passengers: any[];
  created_at: string;
  trips?: Trip;
  profiles?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
}

interface Stats {
  totalBuses: number;
  activeTrips: number;
  totalBookings: number;
  revenue: number;
}

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

const getLowestPrice = (pricing: any): number => {
  if (!pricing) return 0;
  const prices = [
    pricing.lower_double_sleeper,
    pricing.lower_single_sleeper,
    pricing.upper_double_sleeper,
    pricing.upper_single_sleeper,
  ].filter(p => p && p > 0);
  
  return prices.length > 0 ? Math.min(...prices) : 0;
};

export const useAdmin = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBuses: 0,
    activeTrips: 0,
    totalBookings: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchBuses = async () => {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select(`
          *,
          seats(id, seat_number, row, col, deck, is_single, price, status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(bus => ({
        ...bus,
        coach_type: bus.bus_type,
        number: bus.bus_number || bus.id.substring(0, 8).toUpperCase(),
        amenities: []
      })) || [];

      setBuses(formattedData);
      console.log('✅ Buses fetched:', formattedData.length);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch buses', 'error');
    }
  };

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
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
          created_at,
          buses(
            id, 
            name, 
            bus_type, 
            bus_number, 
            total_seats, 
            is_active,
            seats(id, seat_number, row, col, deck, is_single, price, status)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(trip => {
        const departureDate = trip.departure_time.split('T')[0] || trip.departure_time;
        const displayPrice = trip.pricing ? getLowestPrice(trip.pricing) : trip.base_price;
        
        return {
          ...trip,
          from_city: trip.source,
          to_city: trip.destination,
          journey_date: departureDate,
          duration: calculateDuration(trip.departure_time, trip.arrival_time),
          status: 'scheduled',
          pickup_points: trip.pickup_points || [],
          drop_points: trip.drop_points || [],
          base_price: displayPrice,
          pricing: trip.pricing || {
            lower_double_sleeper: trip.base_price,
            lower_single_sleeper: trip.base_price,
            upper_double_sleeper: trip.base_price,
            upper_single_sleeper: trip.base_price,
          }
        };
      }) || [];

      setTrips(formattedData);
      console.log('✅ Trips fetched:', formattedData.length);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch trips', 'error');
    }
  };

  const fetchPromos = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(promo => ({
        ...promo,
        min_booking_amount: promo.min_amount || 0,
        valid_from: promo.created_at,
        valid_until: promo.expires_at || promo.created_at,
        is_active: promo.expires_at ? new Date(promo.expires_at) > new Date() : true,
        used_count: 0,
        description: promo.description || ''
      })) || [];

      setPromos(formattedData);
      console.log('✅ Promos fetched:', formattedData.length);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch promo codes', 'error');
    }
  };

  const fetchBookings = async () => {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          trip_id,
          total_amount,
          status,
          created_at,
          trips(source, destination, departure_time, buses(name))
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        return;
      }

      const userIds = [...new Set(bookingsData.map(b => b.user_id).filter(Boolean))];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      const formattedData = bookingsData.map(booking => {
        const tripDepartureDate = booking.trips?.departure_time.split('T')[0] || booking.trips?.departure_time;
        
        return {
          ...booking,
          booking_number: booking.id.substring(0, 8).toUpperCase(),
          final_amount: booking.total_amount,
          discount_amount: 0,
          payment_status: booking.status,
          booking_status: 'confirmed',
          passengers: [],
          profiles: profilesMap.get(booking.user_id) || { full_name: null, email: null, phone: null },
          trips: booking.trips ? {
            ...booking.trips,
            from_city: booking.trips.source,
            to_city: booking.trips.destination,
            journey_date: tripDepartureDate
          } : undefined
        };
      });

      setBookings(formattedData);
      console.log('✅ Bookings fetched:', formattedData.length);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch bookings', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const [busesRes, tripsRes, bookingsRes] = await Promise.all([
        supabase.from('buses').select('id', { count: 'exact', head: true }),
        supabase
          .from('trips')
          .select('id', { count: 'exact', head: true })
          .gte('departure_time', new Date().toISOString()),
        supabase.from('bookings').select('total_amount'),
      ]);

      const totalBuses = busesRes.count || 0;
      const activeTrips = tripsRes.count || 0;
      const totalBookings = bookingsRes.data?.length || 0;
      const revenue = bookingsRes.data?.reduce((sum, b) => sum + parseFloat(b.total_amount.toString()), 0) || 0;

      setStats({
        totalBuses,
        activeTrips,
        totalBookings,
        revenue,
      });
      
      console.log('✅ Stats:', { totalBuses, activeTrips, totalBookings, revenue });
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const createBus = async (busData: Omit<Bus, 'id' | 'created_at' | 'seats'>) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('buses').insert({
        name: busData.name,
        bus_number: busData.number,
        bus_type: busData.coach_type || busData.bus_type || 'Luxury Sleeper',
        total_seats: busData.total_seats,
        is_active: true,
      });

      if (error) throw error;
      showToast('Bus created successfully', 'success');
      await fetchBuses();
      await fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Failed to create bus', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBus = async (id: string, busData: Partial<Bus>) => {
    setLoading(true);
    try {
      const updateData: any = {};

      if (busData.name) updateData.name = busData.name;
      if (busData.number) updateData.bus_number = busData.number;
      if (busData.coach_type || busData.bus_type) {
        updateData.bus_type = busData.coach_type || busData.bus_type;
      }
      if (busData.total_seats) updateData.total_seats = busData.total_seats;

      const { error } = await supabase.from('buses').update(updateData).eq('id', id);

      if (error) throw error;
      showToast('Bus updated successfully', 'success');
      await fetchBuses();
    } catch (error: any) {
      showToast(error.message || 'Failed to update bus', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBus = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('buses').delete().eq('id', id);

      if (error) throw error;
      showToast('Bus deleted successfully', 'success');
      await fetchBuses();
      await fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete bus', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: Omit<Trip, 'id' | 'created_at' | 'buses'>) => {
    setLoading(true);
    try {
      if (tripData.from_city === tripData.to_city) {
        throw new Error('Departure and destination cities must be different');
      }

      if (!tripData.to_city) {
        throw new Error('Destination city is required');
      }

      const insertData: any = {
        bus_id: tripData.bus_id,
        source: tripData.from_city,
        destination: tripData.to_city,
        departure_time: tripData.departure_time,
        arrival_time: tripData.arrival_time,
        base_price: tripData.base_price,
        pickup_points: tripData.pickup_points || [],
        drop_points: tripData.drop_points || [],
        pricing: tripData.pricing || {
          lower_double_sleeper: tripData.base_price,
          lower_single_sleeper: tripData.base_price,
          upper_double_sleeper: tripData.base_price,
          upper_single_sleeper: tripData.base_price,
        }
      };

      console.log('✅ Creating trip:', {
        source: insertData.source,
        destination: insertData.destination,
        pricing: insertData.pricing,
      });

      const { error, data: insertedTrip } = await supabase
        .from('trips')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Insert error:', error);
        throw error;
      }

      console.log('✅ Trip created successfully:', {
        source: insertedTrip.source,
        destination: insertedTrip.destination,
      });

      if (insertedTrip) {
        const busData = await supabase
          .from('buses')
          .select('total_seats')
          .eq('id', insertedTrip.bus_id)
          .single();

        const { data: existingSeats, count } = await supabase
          .from('seats')
          .select('id', { count: 'exact' })
          .eq('bus_id', insertedTrip.bus_id);

        console.log(`📊 Bus ${insertedTrip.bus_id} has ${count} existing seats`);

        if (!count || count === 0) {
          const seats: any[] = [];
          let seatNumber = 1;

          // LOWER DECK - 20 SEATS
          // Rows 0-5: 1 single (col 0) + 2 double (col 1, 2) = 3 seats each = 18 seats
          for (let row = 0; row < 6; row++) {
            // Single seat
            seats.push({
              bus_id: insertedTrip.bus_id,
              seat_number: `${seatNumber}`,
              seat_type: 'sleeper',
              deck: 'lower',
              row: row,
              col: 0,
              is_single: true,
              is_blocked: false,
              price: insertData.pricing.lower_single_sleeper,
              status: 'available',
            });
            seatNumber++;

            // Double seat 1
            seats.push({
              bus_id: insertedTrip.bus_id,
              seat_number: `${seatNumber}`,
              seat_type: 'sleeper',
              deck: 'lower',
              row: row,
              col: 1,
              is_single: false,
              is_blocked: false,
              price: insertData.pricing.lower_double_sleeper,
              status: 'available',
            });
            seatNumber++;

            // Double seat 2
            seats.push({
              bus_id: insertedTrip.bus_id,
              seat_number: `${seatNumber}`,
              seat_type: 'sleeper',
              deck: 'lower',
              row: row,
              col: 2,
              is_single: false,
              is_blocked: false,
              price: insertData.pricing.lower_double_sleeper,
              status: 'available',
            });
            seatNumber++;
          }

          // Rows 6-7: 1 single (col 0) only = 1 seat each = 2 seats
          for (let row = 6; row < 8; row++) {
            seats.push({
              bus_id: insertedTrip.bus_id,
              seat_number: `${seatNumber}`,
              seat_type: 'sleeper',
              deck: 'lower',
              row: row,
              col: 0,
              is_single: true,
              is_blocked: false,
              price: insertData.pricing.lower_single_sleeper,
              status: 'available',
            });
            seatNumber++;
          }

          // UPPER DECK - 20 SEATS
          // Rows 0-5: 3 double (col 0, 1, 2) = 3 seats each = 18 seats
          for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 3; col++) {
              seats.push({
                bus_id: insertedTrip.bus_id,
                seat_number: `${seatNumber}`,
                seat_type: 'sleeper',
                deck: 'upper',
                row: row,
                col: col,
                is_single: false,
                is_blocked: false,
                price: insertData.pricing.upper_double_sleeper,
                status: 'available',
              });
              seatNumber++;
            }
          }

          // Rows 6-7: 1 double (col 0) only = 1 seat each = 2 seats
          for (let row = 6; row < 8; row++) {
            seats.push({
              bus_id: insertedTrip.bus_id,
              seat_number: `${seatNumber}`,
              seat_type: 'sleeper',
              deck: 'upper',
              row: row,
              col: 0,
              is_single: false,
              is_blocked: false,
              price: insertData.pricing.upper_double_sleeper,
              status: 'available',
            });
            seatNumber++;
          }

          console.log('✅ Creating', seats.length, 'seats for bus', insertedTrip.bus_id);
          console.log('Seat structure:', {
            total: seats.length,
            lowerDeck: 20,
            upperDeck: 20,
            lowerStructure: '6 rows(1S+2D) + 2 rows(1S)',
            upperStructure: '6 rows(3D) + 2 rows(1D)'
          });

          const { error: seatError, data: createdSeats } = await supabase
            .from('seats')
            .insert(seats);

          if (seatError) {
            console.error('❌ Seat creation error:', seatError);
            throw new Error(`Failed to create seats: ${seatError.message}`);
          }

          console.log('✅ Seats created successfully:', seats.length);
        } else {
          console.log('ℹ️ Seats already exist for this bus:', count);
        }
      }

      showToast('Trip created successfully', 'success');
      await fetchTrips();
      await fetchStats();
    } catch (error: any) {
      console.error('❌ Trip creation failed:', error.message);
      showToast(error.message || 'Failed to create trip', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (id: string, tripData: Partial<Trip>) => {
    setLoading(true);
    try {
      if (tripData.from_city && tripData.to_city && tripData.from_city === tripData.to_city) {
        throw new Error('Departure and destination cities must be different');
      }

      const updateData: any = {};

      if (tripData.from_city !== undefined) {
        updateData.source = tripData.from_city;
      }
      if (tripData.to_city !== undefined) {
        updateData.destination = tripData.to_city;
      }
      if (tripData.base_price !== undefined) {
        updateData.base_price = tripData.base_price;
      }
      if (tripData.pricing !== undefined) {
        updateData.pricing = tripData.pricing;
      }
      if (tripData.bus_id !== undefined) {
        updateData.bus_id = tripData.bus_id;
      }
      if (tripData.pickup_points !== undefined) {
        updateData.pickup_points = tripData.pickup_points;
      }
      if (tripData.drop_points !== undefined) {
        updateData.drop_points = tripData.drop_points;
      }
      if (tripData.departure_time !== undefined) {
        updateData.departure_time = tripData.departure_time;
      }
      if (tripData.arrival_time !== undefined) {
        updateData.arrival_time = tripData.arrival_time;
      }

      const { error: updateError } = await supabase
        .from('trips')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw updateError;
      }

      console.log('✅ Trip updated successfully');

      showToast('Trip updated successfully', 'success');
      await fetchTrips();
    } catch (error: any) {
      console.error('❌ Trip update failed:', error.message);
      showToast(error.message || 'Failed to update trip', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('trips').delete().eq('id', id);

      if (error) throw error;
      showToast('Trip deleted successfully', 'success');
      await fetchTrips();
      await fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete trip', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createPromo = async (promoData: Omit<PromoCode, 'id' | 'created_at' | 'used_count'>) => {
    setLoading(true);
    try {
      const insertData: any = {
        code: promoData.code,
        discount_type: promoData.discount_type,
        discount_value: promoData.discount_value,
        min_amount: promoData.min_booking_amount || 0,
        max_discount: promoData.max_discount,
        expires_at: promoData.valid_until,
        usage_limit: promoData.usage_limit,
      };

      const { error } = await supabase.from('promo_codes').insert(insertData);

      if (error) throw error;
      showToast('Promo code created successfully', 'success');
      await fetchPromos();
    } catch (error: any) {
      showToast(error.message || 'Failed to create promo code', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePromo = async (id: string, promoData: Partial<PromoCode>) => {
    setLoading(true);
    try {
      const updateData: any = {};

      if (promoData.code) updateData.code = promoData.code;
      if (promoData.discount_type) updateData.discount_type = promoData.discount_type;
      if (promoData.discount_value !== undefined) updateData.discount_value = promoData.discount_value;
      if (promoData.min_booking_amount !== undefined) updateData.min_amount = promoData.min_booking_amount;
      if (promoData.max_discount !== undefined) updateData.max_discount = promoData.max_discount;
      if (promoData.valid_until) updateData.expires_at = promoData.valid_until;
      if (promoData.usage_limit !== undefined) updateData.usage_limit = promoData.usage_limit;

      const { error } = await supabase.from('promo_codes').update(updateData).eq('id', id);

      if (error) throw error;
      showToast('Promo code updated successfully', 'success');
      await fetchPromos();
    } catch (error: any) {
      showToast(error.message || 'Failed to update promo code', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePromo = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);

      if (error) throw error;
      showToast('Promo code deleted successfully', 'success');
      await fetchPromos();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete promo code', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleSeatBlock = async (seatId: string, currentStatus: string) => {
    setLoading(true);
    try {
      const isCurrentlyBlocked = currentStatus === 'blocked' || currentStatus === 'true' || currentStatus === true;
      const newBlockedState = !isCurrentlyBlocked;

      const { error } = await supabase
        .from('seats')
        .update({ is_blocked: newBlockedState })
        .eq('id', seatId);

      if (error) throw error;
      showToast(
        `Seat ${newBlockedState ? 'blocked' : 'unblocked'} successfully`,
        'success'
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to update seat status', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
    fetchTrips();
    fetchPromos();
    fetchBookings();
    fetchStats();
  }, []);

  return {
    buses,
    trips,
    promos,
    bookings,
    stats,
    loading,
    createBus,
    updateBus,
    deleteBus,
    createTrip,
    updateTrip,
    deleteTrip,
    createPromo,
    updatePromo,
    deletePromo,
    toggleSeatBlock,
    refreshAll: () => {
      fetchBuses();
      fetchTrips();
      fetchPromos();
      fetchBookings();
      fetchStats();
    },
  };
};