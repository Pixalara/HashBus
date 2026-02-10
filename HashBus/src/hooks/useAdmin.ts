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
  const dept = new Date(departure);
  const arr = new Date(arrival);
  const diffMs = arr.getTime() - dept.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(bus => ({
        ...bus,
        coach_type: bus.bus_type,
        number: bus.bus_number || bus.id.substring(0, 8).toUpperCase(),
        amenities: []
      })) || [];

      setBuses(formattedData);
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
          pickup_points,
          drop_points,
          created_at,
          buses(id, name, bus_type, bus_number, total_seats, is_active)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(trip => ({
        ...trip,
        from_city: trip.source,
        to_city: trip.destination,
        journey_date: trip.departure_time,
        duration: calculateDuration(trip.departure_time, trip.arrival_time),
        status: 'scheduled',
        pickup_points: trip.pickup_points || [],
        drop_points: trip.drop_points || []
      })) || [];

      setTrips(formattedData);
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

      const formattedData = bookingsData.map(booking => ({
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
          journey_date: booking.trips.departure_time
        } : undefined
      }));

      setBookings(formattedData);
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
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const createBus = async (busData: Omit<Bus, 'id' | 'created_at'>) => {
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
      const arrivalDate = (tripData as any).arrival_date || tripData.journey_date;
      const insertData: any = {
        bus_id: tripData.bus_id,
        source: tripData.from_city,
        destination: tripData.to_city,
        departure_time: tripData.journey_date && tripData.departure_time
          ? `${tripData.journey_date}T${tripData.departure_time}:00`
          : tripData.departure_time,
        arrival_time: arrivalDate && tripData.arrival_time
          ? `${arrivalDate}T${tripData.arrival_time}:00`
          : tripData.arrival_time,
        base_price: tripData.base_price,
        pickup_points: tripData.pickup_points || [],
        drop_points: tripData.drop_points || [],
      };

      const { error, data: insertedTrip } = await supabase
        .from('trips')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      if (insertedTrip) {
        const busData = await supabase
          .from('buses')
          .select('total_seats')
          .eq('id', insertedTrip.bus_id)
          .single();

        const totalSeats = busData.data?.total_seats || 40;
        const seats = [];

        for (let i = 1; i <= totalSeats; i++) {
          seats.push({
            bus_id: insertedTrip.bus_id,
            seat_number: `${i}`,
            seat_type: 'sleeper',
            is_blocked: false,
          });
        }

        await supabase.from('seats').insert(seats);
      }

      showToast('Trip created successfully', 'success');
      await fetchTrips();
      await fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Failed to create trip', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (id: string, tripData: Partial<Trip>) => {
    setLoading(true);
    try {
      const updateData: any = {};

      if (tripData.from_city) updateData.source = tripData.from_city;
      if (tripData.to_city) updateData.destination = tripData.to_city;
      if (tripData.base_price) updateData.base_price = tripData.base_price;
      if (tripData.bus_id) updateData.bus_id = tripData.bus_id;
      if (tripData.pickup_points !== undefined) updateData.pickup_points = tripData.pickup_points;
      if (tripData.drop_points !== undefined) updateData.drop_points = tripData.drop_points;

      const arrivalDate = (tripData as any).arrival_date || tripData.journey_date;
      if (tripData.journey_date && tripData.departure_time) {
        updateData.departure_time = `${tripData.journey_date}T${tripData.departure_time}:00`;
      } else if (tripData.departure_time) {
        updateData.departure_time = tripData.departure_time;
      }

      if (arrivalDate && tripData.arrival_time) {
        updateData.arrival_time = `${arrivalDate}T${tripData.arrival_time}:00`;
      } else if (tripData.arrival_time) {
        updateData.arrival_time = tripData.arrival_time;
      }

      const { error } = await supabase.from('trips').update(updateData).eq('id', id);

      if (error) throw error;
      showToast('Trip updated successfully', 'success');
      await fetchTrips();
    } catch (error: any) {
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
